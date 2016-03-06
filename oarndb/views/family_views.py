# The OARN Relief Nursery Database
# Copyright (C) 2015  Oregon Association of Relief Nurseries
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from django.http import Http404
from django.db.models import Q

from rest_framework import permissions, generics
from rest_framework.exceptions import PermissionDenied, ValidationError

from oarndb.serializers import PersonListSerializer, PersonDetailSerializer, PersonCreateSerializer
from oarndb.serializers import AdultSerializer, ChildSerializer
from oarndb.serializers import FamilyListSerializer, FamilyCreateSerializer
from oarndb.serializers import FamilyAddressListSerializer, FamilyAddressModelSerializer, FamilyAddressCreateSerializer
from oarndb.serializers import FamilyNotesSerializer, PersonRaceSerializer, PersonLanguageSerializer
from oarndb.serializers import PersonTelephoneSerializer, PersonEmailAddressSerializer
from oarndb.serializers import AdultFamilyRelationshipSerializer, ChildFamilyRelationshipSerializer

from oarndb.models import Person, Adult, Child, Organization, OrganizationPersonRole
from oarndb.models import Family, AdultFamilyRelationship, ChildFamilyRelationship
from oarndb.models import FamilyAddress, PersonRace, PersonLanguage, PersonTelephone, PersonEmailAddress
from oarndb.models import RefRole, RefEmailType
from oarndb.models import AdultFamilyRelationship, ChildFamilyRelationship


class PersonList(generics.ListAPIView):
    """
    A list of clients and staff and their roles in different organizations.

    To appear in this list, the user must have read access to at least one organization linked to the person
    (this is represented in the OrganizationPersonRole model). All links to organizations will be visible if
    the person is, so that cross agency services can be better coordinated.
    """
    serializer_class = PersonListSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            # By default, return everyone this user can see
            return Person.objects.filter(
                organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).distinct().order_by('last_name', 'first_name')
        else:
            staff_only_filter = self.request.query_params.get('staff_only', None)
            org_id_filter = self.request.query_params.get('organization_id', None)
            if staff_only_filter == 'true':
                client_role = RefRole.objects.get(description='Client')

                if org_id_filter:
                    try:
                        int(org_id_filter)
                    except ValueError:
                        return []

                    return Person.objects.filter(
                        organization__in=Organization.objects.get_read_orgs(self.request.user)
                    ).filter(
                        organization__organization_id=org_id_filter
                    ).exclude(
                        organizationpersonrole__ref_role=client_role
                    ).distinct().order_by('last_name', 'first_name')
                else:
                    return Person.objects.filter(
                        organization__in=Organization.objects.get_read_orgs(self.request.user)
                    ).exclude(
                        organizationpersonrole__ref_role=client_role
                    ).distinct().order_by('last_name', 'first_name')
            else:
                if org_id_filter:
                    try:
                        int(org_id_filter)
                    except ValueError:
                        return []

                    return Person.objects.filter(
                        organization__in=Organization.objects.get_read_orgs(self.request.user)
                    ).filter(
                        organization__organization_id=org_id_filter
                    ).distinct().order_by('last_name', 'first_name')
                else:
                    # We need to return the default so that pagination doesn't break
                    return Person.objects.filter(
                        organization__in=Organization.objects.get_read_orgs(self.request.user)
                    ).distinct().order_by('last_name', 'first_name')


class PersonDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    The details of an individual Person record.

    To be visible here, the user must have read access to at least one organization linked to the person.
    (This is represented in the OrganizationPersonRole model).

    To update a Person record, the user must have write access to at least one of the organizations
    the selected person is linked to. In addition, the user must have read access to the specified gender
    (maps to the RefGender model, see: /ref/genders/).

    Delete requires write access to *every* organization the Person record is linked to.
    """
    serializer_class = PersonDetailSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Person.objects.filter(
                organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).distinct().order_by('last_name', 'first_name')

    def delete(self, request, *args, **kwargs):
        try:
            obj = Person.objects.get(pk=kwargs.get('pk', None))
        except self.serializer_class.Meta.model.DoesNotExist:
            raise Http404

        # does the user have write access to every org this Person is linked to?
        if obj.organization.exclude(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).distinct().count() > 0:
            error_msg = "Write access to all organizations this Person is linked to is required for DELETE."
            raise PermissionDenied(detail=error_msg)

        return super(PersonDetail, self).delete(self, request, *args, **kwargs)


class PersonCreate(generics.CreateAPIView):

    serializer_class = PersonCreateSerializer

    permission_classes = (permissions.IsAuthenticated, )


class AdultList(generics.ListCreateAPIView):
    """
    A list of Adult model records. Each record has a one-to-one relationship with a Person record.
    Only create and delete operations are allowed, with access mirroring that of the user's access
    to the Person record.
    """
    serializer_class = AdultSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Adult.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('person_id')


class AdultDetail(generics.RetrieveDestroyAPIView):
    """
    Represents a single Adult model record. Each record has a one-to-one relationship with a Person record.
    Only create and delete operations are allowed, with access mirroring that of the user's access
    to the Person record.
    """
    serializer_class = AdultSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Adult.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('person_id')

    def delete(self, request, *args, **kwargs):
        try:
            obj = Adult.objects.get(pk=kwargs.get('pk', None))
        except Adult.DoesNotExist:
            raise Http404

        if obj.person.organization.filter(organization_id=Organization.objects.get_readwrite_orgs(self.request.user)):
            return super(AdultDetail, self).delete(self, request, *args, **kwargs)
        else:
            raise PermissionDenied(detail="Write access to this record is required for delete.")


class ChildList(generics.ListCreateAPIView):
    """
    A list of Child model records. Each record has a one-to-one relationship with a Person record.
    Only create and delete operations are allowed, with access mirroring that of the user's access
    to the Person record.
    """
    serializer_class = ChildSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Child.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('person_id')


class ChildDetail(generics.RetrieveDestroyAPIView):
    """
    Represents a single Child model record. Each record has a one-to-one relationship with a Person record.
    Only create and delete operations are allowed, with access mirroring that of the user's access
    to the Person record.
    """
    serializer_class = ChildSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Child.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('person_id')

    def delete(self, request, *args, **kwargs):
        try:
            obj = Child.objects.get(pk=kwargs.get('pk', None))
        except Child.DoesNotExist:
            raise Http404

        if obj.person.organization.filter(organization_id=Organization.objects.get_readwrite_orgs(self.request.user)):
            return super(ChildDetail, self).delete(self, request, *args, **kwargs)
        else:
            raise PermissionDenied(detail="Write access to this record is required for delete.")


class FamilyList(generics.ListAPIView):
    """
    A read-only depiction of the children, adults, and organizations linked to each family.

    The nested representations also require read access for them to appear in this list.
    It is therefore possible (although it should be rare) for this list to show an incomplete
    subset of children, adults, and organizations.

    POST requests should be directed to: /family/create/
    """
    serializer_class = FamilyListSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):

        if len(self.request.query_params) == 0:
            return Family.objects.filter(organizations__in=Organization.objects.get_read_orgs(
                self.request.user)).distinct()
        else:
            adult_id_filter = self.request.query_params.get('adult_id', None)
            child_id_filter = self.request.query_params.get('child_id', None)

            if adult_id_filter:
                try:
                    adult = Adult.objects.get(pk=adult_id_filter)
                except Adult.DoesNotExist:
                    raise Http404

                return Family.objects.filter(organizations__in=Organization.objects.get_read_orgs(
                self.request.user)).filter(adultfamilyrelationship__adult__person=adult.person).distinct()
            elif child_id_filter:
                try:
                    child = Child.objects.get(pk=child_id_filter)
                except Child.DoesNotExist:
                    raise Http404

                return Family.objects.filter(organizations__in=Organization.objects.get_read_orgs(
                self.request.user)).filter(childfamilyrelationship__child__person=child.person).distinct()
            else:
                # Necessary to return the full list for unknown filters so that pagination doesn't break
                return Family.objects.filter(organizations__in=Organization.objects.get_read_orgs(
                self.request.user)).distinct()


class FamilyDetail(generics.RetrieveDestroyAPIView):
    """
    Displays individual family record details. Updates must be handled through the endpoints describing
    specific components of the relationship rather than here. Deletion of a family is allowed for users
    with admin rights to every organization the family is linked to, but use caution - the operation may be
    *extremely* destructive as it cascades through the database tables.
    """

    serializer_class = FamilyListSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Family.objects.filter(organizations__in=Organization.objects.get_read_orgs(
            self.request.user)).distinct()

    def delete(self, request, *args, **kwargs):
        try:
            obj = Family.objects.get(pk=kwargs.get('pk', None))
        except Family.DoesNotExist:
            raise Http404

        # does the user have write access to every org this Person is linked to?
        if obj.organizations.exclude(
                organization_id__in=Organization.objects.get_admin_orgs(self.request.user)
        ).distinct().count() > 0:
            error_msg = "Admin access to all organizations this family is linked to is required for DELETE."
            raise PermissionDenied(detail=error_msg)

        return super(FamilyDetail, self).delete(self, request, *args, **kwargs)



class FamilyCreate(generics.CreateAPIView):
    """
    This endpoint is used solely for the creation of new family records.
    Validation:
    - A list of organizations identified by "organization_id" is required.
    - A list of adults, identified by person_id, specifying the relationship type, and with exactly one adult
    identified as the primary_adult is required.
    - An optional list of children, with person_id and relationship type specified, may also be included.

    Write permissions for each organization, adult, and child specified are required, as are read permissions
    for the specified relationship types.

    Example:
    {
        "notes": "Some family notes",
        "organizations": [ {"organization_id":1}],
        "adults": [
            {"person_id": 15324, "primary_adult": true, "ref_adult_family_relationship_type": 1,
             "relationship_begin_date": null, "relationship_end_date": null}
        ],
        "children": [
            {"person_id": 15323, "ref_child_family_relationship_type": 1, "relationship_begin_date": null,
             "relationship_end_date": null }
        ]
    }
    """
    serializer_class = FamilyCreateSerializer

    permission_classes = (permissions.IsAuthenticated,)


class FamilyAddressList(generics.ListAPIView):
    """

    """
    serializer_class = FamilyAddressListSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):

        if len(self.request.query_params) == 0:
            return FamilyAddress.objects.filter(family__organizations__in=Organization.objects.get_read_orgs(
                self.request.user
            )).order_by('family', '-primary_address', '-residence_end_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            if family_id_filter:
                return FamilyAddress.objects.filter(family__organizations__in=Organization.objects.get_read_orgs(
                    self.request.user
                )).filter(family=family_id_filter).order_by('-primary_address', '-residence_end_date')
            else:
                return FamilyAddress.objects.filter(family__organizations__in=Organization.objects.get_read_orgs(
                    self.request.user
                )).order_by('family', '-primary_address', '-residence_end_date')


class FamilyAddressDetail(generics.RetrieveUpdateDestroyAPIView):
    """

    """
    serializer_class = FamilyAddressModelSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return FamilyAddress.objects.filter(family__organizations__in=Organization.objects.get_read_orgs(
            self.request.user
        )).order_by('family', '-primary_address', '-residence_end_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = FamilyAddress.objects.get(pk=kwargs.get('pk', None))
        except FamilyAddress.DoesNotExist:
            raise Http404

        # Does this user have write access to the family?
        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions for this family are required to delete this address record."
                raise PermissionDenied(detail=error_msg)

        return super(FamilyAddressDetail, self).delete(self, request, *args, **kwargs)


class FamilyAddressCreate(generics.CreateAPIView):
    """

    """
    serializer_class = FamilyAddressCreateSerializer

    permission_classes = (permissions.IsAuthenticated,)


class FamilyNotesDetail(generics.RetrieveUpdateAPIView):
    """
    This endpoint provides simple retrieve/update access to a given family's notes.
    """

    serializer_class = FamilyNotesSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Family.objects.filter(organizations__in=Organization.objects.get_read_orgs(
            self.request.user
        )).order_by('family', '-primary_address', '-residence_end_date')


class PersonRaceList(generics.ListCreateAPIView):
    """
    This endpoint describes the race demographics for a given person, according to the federal categories.
    """

    serializer_class = PersonRaceSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return PersonRace.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('person_id')


class PersonRaceDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    This endpoint allows for the updating and deleting of a given person's race demographic details.
    """

    serializer_class = PersonRaceSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return PersonRace.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            )

    def delete(self, request, *args, **kwargs):
        try:
            obj = PersonRace.objects.get(pk=kwargs.get('pk', None))
        except PersonRace.DoesNotExist:
            raise Http404

        # Does this user have write access to the person?
        if obj.person.organization.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions for this person are required to delete this record."
                raise PermissionDenied(detail=error_msg)

        return super(PersonRaceDetail, self).delete(self, request, *args, **kwargs)


class PersonLanguageList(generics.ListCreateAPIView):
    """
    This endpoint links languages to Person records. Read/write access to these records is drawn from the
    read/write access the user has to the related Person record, with the added proviso that read access is
    required to the supplied language and language use type values as well.
    """

    serializer_class = PersonLanguageSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return PersonLanguage.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('person_id')
        else:
            person_id_filter = self.request.query_params.get('person_id', None)
            if person_id_filter:
                return PersonLanguage.objects.filter(
                    person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(person__person_id=person_id_filter).order_by('-created_at')
            else:
                return PersonLanguage.objects.filter(
                    person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('person_id')


class PersonLanguageDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    This endpoint links languages to a specific Person record. Read/write/delete access to these records is drawn from
    the read/write access the user has to the related Person record, with the added proviso that read access is
    required to the supplied language and language use type values as well.
    """

    serializer_class = PersonLanguageSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return PersonLanguage.objects.filter(
            person__organization__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('person_id')

    def delete(self, request, *args, **kwargs):
        try:
            obj = PersonLanguage.objects.get(pk=kwargs.get('pk', None))
        except PersonLanguage.DoesNotExist:
            raise Http404

        # Does this user have write access to the person?
        if obj.person.organization.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions for this person are required to delete this record."
                raise PermissionDenied(detail=error_msg)

        return super(PersonLanguageDetail, self).delete(self, request, *args, **kwargs)

class PersonTelephoneList(generics.ListCreateAPIView):
    """
    This endpoint provides a list of telephone numbers, each linked to both a Person record and a RefPersonTelephoneType
    record. Read/write/delete access to these records is drawn from the read/write access the user has to the
    related Person record, with the added proviso that read access is required to the supplied
    telephone type values as well.
    """

    serializer_class = PersonTelephoneSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return PersonTelephone.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('person_id')
        else:
            person_id_filter = self.request.query_params.get('person_id', None)
            if person_id_filter:
                return PersonTelephone.objects.filter(
                    person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(person__person_id=person_id_filter).order_by('-created_at')
            else:
                return PersonTelephone.objects.filter(
                    person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('person_id')


class PersonTelephoneDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    This endpoint provides the details for a single telephone number, which is linked to both a Person record and to
    a RefPersonTelephoneType record. Read/write/delete access to these records is drawn from the read/write access
    the user has to the related Person record, with the added proviso that read access is required to the supplied
    telephone type values as well.
    """
    serializer_class = PersonTelephoneSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return PersonTelephone.objects.filter(
            person__organization__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('person_id')

    def delete(self, request, *args, **kwargs):
        try:
            obj = PersonTelephone.objects.get(pk=kwargs.get('pk', None))
        except PersonTelephone.DoesNotExist:
            raise Http404

        # Does this user have write access to the person?
        if obj.person.organization.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions for this person are required to delete this record."
                raise PermissionDenied(detail=error_msg)

        return super(PersonTelephoneDetail, self).delete(self, request, *args, **kwargs)


class PersonEmailAddressList(generics.ListCreateAPIView):
    """
    This endpoint provides a list of email addresses, each linked to both a Person record and a RefEmailType
    record. Read/write/delete access to these records is drawn from the read/write access the user has to the
    related Person record, with the added proviso that read access is required to the supplied
    email type values as well.
    """

    serializer_class = PersonEmailAddressSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return PersonEmailAddress.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('person_id')
        else:
            person_id_filter = self.request.query_params.get('person_id', None)
            if person_id_filter:
                return PersonEmailAddress.objects.filter(
                    person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(person__person_id=person_id_filter).order_by('-created_at')
            else:
                return PersonEmailAddress.objects.filter(
                    person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('person_id')


class PersonEmailAddressDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    This endpoint provides the details for a single email address, which is linked to both a Person record and to
    a RefEmailType record. Read/write/delete access to these records is drawn from the read/write access
    the user has to the related Person record, with the added proviso that read access is required to the supplied
    email type values as well.
    """
    serializer_class = PersonEmailAddressSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return PersonEmailAddress.objects.filter(
            person__organization__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('person_id')

    def delete(self, request, *args, **kwargs):
        try:
            obj = PersonEmailAddress.objects.get(pk=kwargs.get('pk', None))
        except PersonEmailAddress.DoesNotExist:
            raise Http404

        # Does this user have write access to the person?
        if obj.person.organization.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions for this person are required to delete this record."
                raise PermissionDenied(detail=error_msg)

        return super(PersonEmailAddressDetail, self).delete(self, request, *args, **kwargs)


class AdultFamilyRelationshipList(generics.ListCreateAPIView):
    """
    The AdultFamilyRelationship model describes the link between a given adult and a given family.
    A single adult may have multiple relationship records over time with a family, and may have
    links to multiple families. Create, delete, and update operations require write permissions to
    both the family and person, as well as read-access to whatever relationship type is supplied.

    Only one primary adult may be assigned to a particular family at any time. A side effect of setting
    primary_adult to True is setting it to False in every other AdultFamilyRelationship record for
    this family.
    """
    serializer_class = AdultFamilyRelationshipSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return AdultFamilyRelationship.objects.filter(
                adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('adult__person__person_id', '-relationship_end_date')
        else:
            person_id_filter = self.request.query_params.get('person_id', None)
            family_id_filter = self.request.query_params.get('family_id', None)
            if person_id_filter and family_id_filter:
                return AdultFamilyRelationship.objects.filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(adult__person__person_id=person_id_filter).filter(
                    family=family_id_filter
                ).order_by('adult__person__person_id', '-relationship_end_date')
            elif person_id_filter:
                return AdultFamilyRelationship.objects.filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(adult__person__person_id=person_id_filter).order_by('adult__person__person_id',
                                                                             '-relationship_end_date')
            elif family_id_filter:
                return AdultFamilyRelationship.objects.filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family=family_id_filter).order_by('adult__person__person_id', '-relationship_end_date')

            else:
                return AdultFamilyRelationship.objects.filter(
                    adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('adult__person__person_id', '-relationship_end_date')


class AdultFamilyRelationshipDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    The AdultFamilyRelationship model describes the link between a given adult and a given family.
    A single adult may have multiple relationship records over time with a family, and may have
    links to multiple families. Create, delete, and update operations require write permissions to
    both the family and person, as well as read-access to whatever relationship type is supplied.

    Only one primary adult may be assigned to a particular family at any time. A side effect of setting
    primary_adult to True is setting it to False in every other AdultFamilyRelationship record for
    this family.
    """
    serializer_class = AdultFamilyRelationshipSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return AdultFamilyRelationship.objects.filter(
                adult__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('adult__person__person_id', '-relationship_end_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = AdultFamilyRelationship.objects.get(pk=kwargs.get('pk', None))
        except AdultFamilyRelationship.DoesNotExist:
            raise Http404

        # Does this user have write access to the person?
        if obj.adult.person.organization.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions for this adult are required to delete this record."
                raise PermissionDenied(detail=error_msg)

        # Does this user have write access to the family?
        if obj.family.organizations.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() == 0:
                error_msg = "Write permissions for this family are required to delete this record."
                raise PermissionDenied(detail=error_msg)

        # the user cannot delete the primary adult:
        if obj.primary_adult:
            error_msg = "The primary adult relationship cannot be deleted. Please set another adult linked to " \
                        "this family as primary prior to deleting this relationship."
            raise PermissionDenied(detail=error_msg)

        return super(AdultFamilyRelationshipDetail, self).delete(self, request, *args, **kwargs)


class ChildFamilyRelationshipList(generics.ListCreateAPIView):
    """
    The ChildFamilyRelationship model describes the link between a given child and a given family.
    A single child may have multiple relationship records over time with a family, and may have
    links to multiple families. Create, delete, and update operations require write permissions to
    both the family and person, as well as read-access to whatever relationship type is supplied.
    """
    serializer_class = ChildFamilyRelationshipSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return ChildFamilyRelationship.objects.filter(
                child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('child__person__person_id', '-relationship_end_date')
        else:
            person_id_filter = self.request.query_params.get('person_id', None)
            family_id_filter = self.request.query_params.get('family_id', None)
            if person_id_filter and family_id_filter:
                return ChildFamilyRelationship.objects.filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(child__person__person_id=person_id_filter).filter(
                    family=family_id_filter
                ).order_by('child__person__person_id', '-relationship_end_date')
            elif person_id_filter:
                return ChildFamilyRelationship.objects.filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(child__person__person_id=person_id_filter).order_by('child__person__person_id',
                                                                             '-relationship_end_date')
            elif family_id_filter:
                return ChildFamilyRelationship.objects.filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family=family_id_filter).order_by('child__person__person_id', '-relationship_end_date')

            else:
                return ChildFamilyRelationship.objects.filter(
                    child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('child__person__person_id', '-relationship_end_date')


class ChildFamilyRelationshipDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    The ChildFamilyRelationship model describes the link between a given child and a given family.
    A single child may have multiple relationship records over time with a family, and may have
    links to multiple families. Create, delete, and update operations require write permissions to
    both the family and person, as well as read-access to whatever relationship type is supplied.
    """
    serializer_class = ChildFamilyRelationshipSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return ChildFamilyRelationship.objects.filter(
                child__person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('child__person__person_id', '-relationship_end_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = ChildFamilyRelationship.objects.get(pk=kwargs.get('pk', None))
        except ChildFamilyRelationship.DoesNotExist:
            raise Http404

        # Does this user have write access to the person?
        if obj.child.person.organization.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions for this child are required to delete this record."
                raise PermissionDenied(detail=error_msg)

        # Does this user have write access to the family?
        if obj.family.organizations.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() == 0:
                error_msg = "Write permissions for this family are required to delete this record."
                raise PermissionDenied(detail=error_msg)

        return super(ChildFamilyRelationshipDetail, self).delete(self, request, *args, **kwargs)