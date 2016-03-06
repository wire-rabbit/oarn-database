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

import copy

from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError

from oarndb.models import Family, AdultFamilyRelationship, ChildFamilyRelationship
from oarndb.models import Adult, Child, Person, Organization
from oarndb.models import RefAdultFamilyRelationshipType, RefChildFamilyRelationshipType
from oarndb.models import OrganizationFamilyLink, FamilyAddress, RefCounty, RefState, RefLocationType
from oarndb.models import PersonRace, PersonLanguage, PersonEmailAddress, PersonTelephone
from oarndb.models import RefPersonTelephoneNumberType, RefEmailType, RefAdultFamilyRelationshipType

from oarndb.serializers import NestedPersonSerializer, NestedAdultSerializer, NestedChildSerializer
from oarndb.serializers import NestedAdultFamilyRelationshipSerializer, NestedChildFamilyRelationshipSerializer
from oarndb.serializers import NestedOrganizationSerializer
from oarndb.serializers import RefStateSerializer, RefCountySerializer, RefLocationTypeSerializer


class FamilyListSerializer(serializers.ModelSerializer):
    """
    Presents a read-only list showing all the children, adults, and organizations linked to
    the hub of a Family record.
    """

    adultfamilyrelationship_set = NestedAdultFamilyRelationshipSerializer(many=True, partial=True)

    childfamilyrelationship_set = NestedChildFamilyRelationshipSerializer(many=True, partial=True)

    organizations = NestedOrganizationSerializer(many=True, partial=True)

    class Meta:
        model = Family

        fields = (
            'family_id',
            'notes',
            'organizations',
            'adultfamilyrelationship_set',
            'childfamilyrelationship_set',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by'
        )


class AdultListSerializer(serializers.Serializer):
    """
    To create a family record we need to be able to supply a list of related families.
    Nested serializers currently aren't quite up to the task (so far as I can tell), so
    this represents a relationship between an adult and a family without actually being
    directly tied to the AdultFamilyRelationship model. This is used exclusively by
    FamilyCreateSerializer, below.
    """

    person_id = serializers.IntegerField()

    primary_adult = serializers.BooleanField()

    ref_adult_family_relationship_type = serializers.IntegerField()

    relationship_begin_date = serializers.DateField(required=False, allow_null=True)

    relationship_end_date = serializers.DateField(required=False, allow_null=True)

    def validate_person_id(self, value):
        try:
            p = Adult.objects.get(person=value)
        except Adult.DoesNotExist:
            raise ValidationError(detail="Adult does not exist")
        return value

    def validate_ref_adult_family_relationship_type(self, value):
        try:
            r = RefAdultFamilyRelationshipType.objects.get(pk=value)
        except RefAdultFamilyRelationshipType.DoesNotExist:
            raise ValidationError(detail="RefAdultFamilyRelationshipType does not exist")
        return value


class ChildListSerializer(serializers.Serializer):
    """
    To create a family record we need to be able to supply a list of related families.
    Nested serializers currently aren't quite up to the task (so far as I can tell), so
    this represents a relationship between a child and a family without actually being
    directly tied to the ChildFamilyRelationship model. This is used exclusively by
    FamilyCreateSerializer, below.
    """

    person_id = serializers.IntegerField()

    ref_child_family_relationship_type = serializers.IntegerField()

    relationship_begin_date = serializers.DateField(required=False, allow_null=True)

    relationship_end_date = serializers.DateField(required=False, allow_null=True)

    def validate_person_id(self, value):
        try:
            p = Child.objects.get(person=value)
        except Child.DoesNotExist:
            raise ValidationError(detail="Child does not exist")
        return value

    def validate_ref_child_family_relationship_type(self, value):
        try:
            r = RefChildFamilyRelationshipType.objects.get(pk=value)
        except RefChildFamilyRelationshipType.DoesNotExist:
            raise ValidationError(detail="RefChildFamilyRelationshipType does not exist")
        return value


class OrganizationListSerializer(serializers.Serializer):
    """
    To create a family record we need to be able to supply a list of related organizations.
    Nested serializers currently aren't quite up to the task (so far as I can tell), so
    this represents a relationship between an organization and a family without actually being
    directly tied to the OrganizationFamilyLink model. This is used exclusively by
    FamilyCreateSerializer, below.
    """

    organization_id = serializers.IntegerField()

    def validate_organization_id(self, value):
        try:
            org = Organization.objects.get(pk=value)
        except Organization.DoesNotExist:
            raise ValidationError(detail="Organization does not exist")
        return value


class FamilyCreateSerializer(serializers.Serializer):
    """
    To create a family record we need to be able to supply a list of related families.
    This uses the stub-serializers above to describe a family using existing children,
    adults, and organizations without actually linkign directly to the models. The
    create method then uses the PKs supplied by the sub-serializers to handle validation
    against the ORM and, eventually, to create the new Family record.
    """

    family_id = serializers.IntegerField(read_only=True)

    notes = serializers.CharField(max_length=10000, required=False, allow_blank=True)

    organizations = OrganizationListSerializer(many=True)

    adults = AdultListSerializer(many=True)

    children = ChildListSerializer(many=True)

    def create(self, validated_data):
        """
        Creates a new family record.

        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:

            original_data = copy.deepcopy(validated_data) # for returning at the end in case of success

            org_list = validated_data.pop('organizations', None)
            if not org_list:
                raise ValidationError(detail="At least one organization must be supplied")

            adults_list = validated_data.pop('adults', None)
            if not adults_list:
                raise ValidationError(detail="At least one adult must be supplied")

            child_list = validated_data.pop('children', None)
            # It's OK for the child list to be empty, so we can move onto the next level of validation:

            # 1) Does the user have write access to every organization supplied?
            for org in org_list:
                # that the org exists has already been established by the serializer:
                test_org = Organization.objects.get(pk=org["organization_id"])

                if test_org not in Organization.objects.get_readwrite_orgs(request.user):
                    error_msg = "Write permissions are required for: " + str(test_org)
                    raise PermissionDenied(detail=error_msg)

            # 2) Does the user have write access to every adult supplied?
            #    And is there exactly one primary adult set?

            primary_tally = 0
            for adult in adults_list:
                # that the adult exists has already been established by the serializer:
                test_adult = Adult.objects.get(person=adult["person_id"])

                if test_adult.person not in Person.objects.filter(
                        organization__in=Organization.objects.get_readwrite_orgs(request.user)
                ):
                    error_msg = "Write permissions are required for all supplied adult records."
                    raise PermissionDenied(detail=error_msg)

                # 2.1) Does the user have read access to the RefAdultFamilyRelationshipType record supplied?

                # that the retype exists has already been established by the serializer:
                test_rel = RefAdultFamilyRelationshipType.objects.get(pk=adult["ref_adult_family_relationship_type"])

                if not test_rel.universal:
                    if test_rel.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected RefAdultFamilyRelationshipType."
                        raise PermissionDenied(detail=error_msg)

                if adult["primary_adult"]:
                    primary_tally = primary_tally + 1

            if primary_tally != 1:
                raise ValidationError("Exactly one primary adult must be set")

            # 3) If children were supplied, does hte user have write access to each of them?
            if child_list:
                for child in child_list:
                    # that the child exists has already been established by the serializer:
                    test_child = Child.objects.get(person=child["person_id"])

                    if test_child.person not in Person.objects.filter(
                            organization__in=Organization.objects.get_readwrite_orgs(request.user)
                    ):
                        error_msg = "Write permissions are required for all supplied child records."
                        raise PermissionDenied(detail=error_msg)

                    # 3.1) Does the user have read access to the RefChildFamilyRelationshipType record supplied?
                    # that the retype exists has already been established by the serializer:
                    test_rel = RefChildFamilyRelationshipType.objects.get(
                        pk=child["ref_child_family_relationship_type"])

                    if not test_rel.universal:
                        if test_rel.organization not in Organization.objects.get_read_orgs(request.user):
                            error_msg = "Read permissions are required for the selected RefChildFamilyRelationshipType."
                            raise PermissionDenied(detail=error_msg)

            # Now we can create the family record:
            new_family = Family.objects.create(
                notes=validated_data.get('notes', None),
                created_by=request.user
            )
            new_family.save()

            for org in org_list:
                # We know this is available from the serializer validation:
                new_org = Organization.objects.get(pk=org['organization_id'])
                OrganizationFamilyLink.objects.create(family=new_family, organization=new_org)

            for adult in adults_list:

                rel_type = RefAdultFamilyRelationshipType.objects.get(
                        pk=adult["ref_adult_family_relationship_type"])

                current_adult = Adult.objects.get(pk=adult["person_id"])

                new_adult_relationship = AdultFamilyRelationship.objects.create(
                    family=new_family,
                    adult=current_adult,
                    ref_adult_family_relationship_type=rel_type,
                    primary_adult=adult["primary_adult"],
                    relationship_begin_date=adult["relationship_begin_date"],
                    relationship_end_date=adult["relationship_end_date"],
                    created_by=request.user
                )

                new_adult_relationship.save()

            if child_list:
                for child in child_list:

                    rel_type = RefChildFamilyRelationshipType.objects.get(
                            pk=child["ref_child_family_relationship_type"])

                    current_child = Child.objects.get(pk=child["person_id"])

                    new_child_relationship = ChildFamilyRelationship.objects.create(
                        family=new_family,
                        child=current_child,
                        ref_child_family_relationship_type=rel_type,
                        relationship_begin_date=child["relationship_begin_date"],
                        relationship_end_date=child["relationship_end_date"],
                        created_by=request.user
                    )

                    new_child_relationship.save()

            original_data['family_id'] = new_family.family_id
            return original_data

        else:
            raise ValidationError(detail="No request context provided")


class FamilyAddressListSerializer(serializers.ModelSerializer):

    read_only = serializers.SerializerMethodField('is_read_only')

    ref_state = RefStateSerializer()
    ref_county = RefCountySerializer()
    ref_location_type = RefLocationTypeSerializer()

    class Meta:
        model = FamilyAddress

        fields = (
            'family_address_id',
            'family',
            'ref_location_type',
            'street_number_and_name',
            'apartment_room_or_suite_number',
            'city',
            'ref_state',
            'postal_code',
            'ref_county',
            'residence_end_date',
            'primary_address',
            'notes',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)
        error_msg = "User has insufficient rights for this update operation."

        if request is not None:
            if obj.family.organizations.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() > 0:
                return False
            else:
                return True

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")


class FamilyAddressModelSerializer(serializers.ModelSerializer):

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = FamilyAddress

        fields = (
            'family_address_id',
            'family',
            'ref_location_type',
            'street_number_and_name',
            'apartment_room_or_suite_number',
            'city',
            'ref_state',
            'postal_code',
            'ref_county',
            'residence_end_date',
            'primary_address',
            'notes',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)

        if request is not None:
            if obj.family.organizations.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() > 0:
                return False
            else:
                return True

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def update(self, instance, validated_data):
        """

        :param instance:
        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the supplied family?
            family = validated_data.get('family', None)
            if not family:
                raise ValidationError(detail="Family does not exist")

            if family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this family record."
                raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied location type?
            location_type = validated_data.get('ref_location_type', None)
            if location_type: # nulls are allowed
                if not location_type.universal:
                    if location_type.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected location type."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied state?
            state = validated_data.get('ref_state', None)
            if state: # nulls are allowed
                if not state.universal:
                    if state.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected state."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied county?
            county = validated_data.get('ref_county', None)
            if county: # nulls are allowed
                if not county.universal:
                    if county.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected county."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have write access to the target family?
            if instance.family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for the family record being updated."
                raise PermissionDenied(detail=error_msg)

            # Update the instance:
            validated_data['modified_by'] = request.user
            # A side-effect is that if the primary address is set to True, all other addresses
            # related to this family have thier primary address set to False.
            primary = validated_data.get('primary_address', None)
            if not primary:
                validated_data['primary_address'] = False

            if validated_data['primary_address']:
                for address in FamilyAddress.objects.filter(family=family).exclude(family_address_id=instance.pk):
                    if address.primary_address:
                        address.primary_address = False
                        address.save()
            return super(FamilyAddressModelSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class FamilyAddressCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = FamilyAddress

        fields = (
            'family_address_id',
            'family',
            'ref_location_type',
            'street_number_and_name',
            'apartment_room_or_suite_number',
            'city',
            'ref_state',
            'postal_code',
            'ref_county',
            'residence_end_date',
            'primary_address',
            'notes',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by'
        )

    def create(self, validated_data):
        """

        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the supplied family?
            family = validated_data.get('family', None)
            if not family:
                raise ValidationError(detail="Family does not exist")

            if family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this family record."
                raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied location type?
            location_type = validated_data.get('ref_location_type', None)
            if location_type: # nulls are allowed
                if not location_type.universal:
                    if location_type.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected location type."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied state?
            state = validated_data.get('ref_state', None)
            if state: # nulls are allowed
                if not state.universal:
                    if state.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected state."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied county?
            county = validated_data.get('ref_county', None)
            if county: # nulls are allowed
                if not county.universal:
                    if county.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected county."
                        raise PermissionDenied(detail=error_msg)

            # Create the instance:
            validated_data['created_by'] = request.user
            # A side-effect is that if the primary address is set to True, all other addresses
            # related to this family have thier primary address set to False.
            if validated_data['primary_address']:
                for address in FamilyAddress.objects.filter(family=family):
                    if address.primary_address:
                        address.primary_address = False
                        address.save()

            return super(FamilyAddressCreateSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class FamilyNotesSerializer(serializers.ModelSerializer):
    """
    A simple serializer handling family notes.
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = Family
        fields = (
            'family_id',
            'notes',
            'read_only'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)
        error_msg = "User has insufficient rights for this update operation."

        if request is not None:
            if obj.organizations.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() > 0:
                return False
            else:
                return True

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")


class PersonRaceSerializer(serializers.ModelSerializer):
    """
    Describes a person's race using the federal categories
    """

    person_id = serializers.IntegerField()

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = PersonRace

        fields = (
            'person_id',
            'hispanic_latino_ethnicity',
            'american_indian',
            'asian',
            'black',
            'pacific',
            'white',
            'multiracial',
            'unreported',
            'other',
            'other_details',
            'read_only',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by'
        )

    def validate_person_id(self, value):
        try:
            p = Person.objects.get(person_id=value)
        except Person.DoesNotExist:
            raise ValidationError(detail="Person does not exist")
        return value

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)
        error_msg = "User has insufficient rights for this update operation."

        if request is not None:
            if obj.person.organization.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() > 0:
                return False
            else:
                return True

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        """
        Creates a new PersonRace instance.

        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to this person?
            person_id = validated_data.get('person_id', None)
            if not person_id:
                raise ValidationError(detail="Person does not exist.")

            try:
                person = Person.objects.get(pk=person_id)
            except Person.DoesNotExist:
                raise ValidationError(detail="Person does not exist.")

            if person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            return PersonRace.objects.create(
                person=person,
                american_indian=validated_data.get('american_indian', False),
                asian=validated_data.get('asian', False),
                black=validated_data.get('black', False),
                pacific=validated_data.get('pacific', False),
                white=validated_data.get('white', False),
                other=validated_data.get('other', False),
                other_details=validated_data.get('other_details', ""),
            )

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        """
        Updates an existing instance of PersonRace.

        :param instance:
        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        view = self.context.get('view')

        if request:
            # Does the user have write permissions for this instance?
            if instance.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            try:
                person = Person.objects.get(person_id=view.kwargs['pk'])
            except Person.DoesNotExist:
                raise ValidationError(detail="Person does not exist.")

            if person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            return super(PersonRaceSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class PersonLanguageSerializer(serializers.ModelSerializer):

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = PersonLanguage

        fields = (
            'person_language_id',
            'person',
            'ref_language',
            'ref_language_use_type',
            'other_details',
            'read_only',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by'
        )

    def create(self, validated_data):
        """
        Creates a new PersonLanguage instance.

        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:
            person = validated_data.get('person', None)
            if not person:
                raise ValidationError(detail="Person does not exist.")

            if person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            ref_language = validated_data.get('ref_language', None)
            if ref_language:
                if not ref_language.universal:
                    if ref_language.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this language selection."
                        raise PermissionDenied(detail=error_msg)

            ref_language_use_type = validated_data.get('ref_language_use_type', None)
            if ref_language_use_type:
                if not ref_language_use_type.universal:
                    if ref_language_use_type.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this language use type selection."
                        raise PermissionDenied(detail=error_msg)

            return PersonLanguage.objects.create(
                person=person,
                ref_language=ref_language,
                ref_language_use_type=ref_language_use_type,
                other_details=validated_data.get('other_details', None),
                created_by=request.user
            )

    def update(self, instance, validated_data):
        """
        Updates an existing instance of PersonLanguage.

        :param instance:
        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        view = self.context.get('view')

        if request:
            # Does the user have write permissions for this instance?
            if instance.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            person = validated_data.get('person', None)
            if not person:
                raise ValidationError(detail="Person does not exist.")

            if person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            # Does the validated data contain acceptable lookup values?
            ref_language = validated_data.get('ref_language', None)
            if ref_language:
                if not ref_language.universal:
                    if ref_language.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this language selection."
                        raise PermissionDenied(detail=error_msg)

            ref_language_use_type = validated_data.get('ref_language_use_type', None)
            if ref_language_use_type:
                if not ref_language_use_type.universal:
                    if ref_language_use_type.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this language use type selection."
                        raise PermissionDenied(detail=error_msg)

            validated_data['modified_by'] = request.user
            return super(PersonLanguageSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)

        if request is not None:
            if obj.person.organization.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() > 0:
                return False
            else:
                return True

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")


class PersonTelephoneSerializer(serializers.ModelSerializer):

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = PersonTelephone

        fields = (
            'person_telephone_id',
            'person',
            'telephone_number',
            'ref_person_telephone_number_type',
            'read_only',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)

        if request is not None:
            if obj.person.organization.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() > 0:
                return False
            else:
                return True

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        """
        Creates a new PersonTelephone instance.

        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:
            person = validated_data.get('person', None)
            if not person:
                raise ValidationError(detail="Person does not exist.")

            if person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            ref_person_telephone_number_type = validated_data.get('ref_person_telephone_number_type', None)
            if ref_person_telephone_number_type:
                if not ref_person_telephone_number_type.universal:
                    if ref_person_telephone_number_type.organization not in \
                            Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this telephone type selection."
                        raise PermissionDenied(detail=error_msg)

            return PersonTelephone.objects.create(
                person=person,
                telephone_number=validated_data.get('telephone_number'),
                ref_person_telephone_number_type=ref_person_telephone_number_type,
                created_by=request.user
            )

    def update(self, instance, validated_data):
        """
        Updates an existing instance of PersonTelephone.

        :param instance:
        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        view = self.context.get('view')

        if request:
            # Does the user have write permissions for this instance?
            if instance.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            person = validated_data.get('person', None)
            if not person:
                raise ValidationError(detail="Person does not exist.")

            if person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            # Does the validated data contain acceptable lookup values?
            ref_person_telephone_number_type = validated_data.get('ref_person_telephone_number_type', None)
            if ref_person_telephone_number_type:
                if not ref_person_telephone_number_type.universal:
                    if ref_person_telephone_number_type.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this telephone type selection."
                        raise PermissionDenied(detail=error_msg)

            validated_data['modified_by'] = request.user
            return super(PersonTelephoneSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class PersonEmailAddressSerializer(serializers.ModelSerializer):

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = PersonEmailAddress

        fields = (
            'person_email_address_id',
            'person',
            'email_address',
            'ref_email_type',
            'read_only'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)

        if request is not None:
            if obj.person.organization.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() > 0:
                return False
            else:
                return True

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        """
        Creates a new PersonEmailAddress instance.

        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:
            person = validated_data.get('person', None)
            if not person:
                raise ValidationError(detail="Person does not exist.")

            if person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            ref_email_type = validated_data.get('ref_email_type', None)
            if ref_email_type:
                if not ref_email_type.universal:
                    if ref_email_type.organization not in \
                            Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this email type selection."
                        raise PermissionDenied(detail=error_msg)

            return PersonEmailAddress.objects.create(
                person=person,
                email_address=validated_data.get('email_address'),
                ref_email_type=ref_email_type,
                created_by=request.user
            )

    def update(self, instance, validated_data):
        """
        Updates an existing instance of PersonEmailAddress.

        :param instance:
        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        view = self.context.get('view')

        if request:
            # Does the user have write permissions for this instance?
            if instance.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            person = validated_data.get('person', None)
            if not person:
                raise ValidationError(detail="Person does not exist.")

            if person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this person record."
                raise PermissionDenied(detail=error_msg)

            # Does the validated data contain acceptable lookup values?
            ref_email_type = validated_data.get('ref_email_type', None)
            if ref_email_type:
                if not ref_email_type.universal:
                    if ref_email_type.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this email type selection."
                        raise PermissionDenied(detail=error_msg)

            validated_data['modified_by'] = request.user
            return super(PersonEmailAddressSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class AdultFamilyRelationshipSerializer(serializers.ModelSerializer):

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = AdultFamilyRelationship

        fields = (
            'adult_family_relationship_id',
            'adult',
            'family',
            'ref_adult_family_relationship_type',
            'primary_adult',
            'relationship_begin_date',
            'relationship_end_date',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)

        if request is not None:
            if obj.adult.person.organization.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() > 0:
                return False
            else:
                return True

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        """
        Creates a new AdultFamilyRelationship instance.

        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:
            adult = validated_data.get('adult', None)
            if not adult:
                raise ValidationError(detail="Adult does not exist.")

            if adult.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this adult record."
                raise PermissionDenied(detail=error_msg)

            family = validated_data.get('family', None)
            if not family:
                raise ValidationError(detail="Family does not exist.")

            if family.organizations.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() == 0:
                raise PermissionDenied(detail='Write permissions are required for this family record.')

            # We want only one link per person per family:
            if AdultFamilyRelationship.objects.filter(family=family).filter(adult=adult).count() > 0:
                raise ValidationError(detail="The supplied adult is already linked to this family")

            ref_adult_family_relationship_type = validated_data.get('ref_adult_family_relationship_type', None)
            if ref_adult_family_relationship_type:
                if not ref_adult_family_relationship_type.universal:
                    if ref_adult_family_relationship_type.organization not in \
                            Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this relationship type selection."
                        raise PermissionDenied(detail=error_msg)

            primary_adult = validated_data.get('primary_adult', False)
            if primary_adult:
                # We can only have one primary adult record per family at a given time:
                for rec in AdultFamilyRelationship.objects.filter(family=family):
                    if rec.primary_adult:
                        rec.primary_adult = False
                        rec.save()

            return AdultFamilyRelationship.objects.create(
                adult=adult,
                family=family,
                ref_adult_family_relationship_type=ref_adult_family_relationship_type,
                primary_adult=primary_adult,
                relationship_begin_date=validated_data.get('relationship_begin_date', None),
                relationship_end_date=validated_data.get('relationship_end_date', None),
                created_by=request.user
            )

    def update(self, instance, validated_data):
        """
        Updates an existing instance of AdultFamilyRelationship.

        :param instance:
        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        view = self.context.get('view')

        if request:
            # Does the user have write permissions for this instance?
            if instance.adult.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this adult record."
                raise PermissionDenied(detail=error_msg)

            adult = validated_data.get('adult', None)
            if not adult:
                raise ValidationError(detail="Adult does not exist.")

            if adult.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this adult record."
                raise PermissionDenied(detail=error_msg)

            family = validated_data.get('family', None)
            if not family:
                raise ValidationError(detail="Family does not exist.")

            if family.organizations.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() == 0:
                raise PermissionDenied(detail='Write permissions are required for this family record.')

            ref_adult_family_relationship_type = validated_data.get('ref_adult_family_relationship_type', None)
            if ref_adult_family_relationship_type:
                if not ref_adult_family_relationship_type.universal:
                    if ref_adult_family_relationship_type.organization not in \
                            Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this relationship type selection."
                        raise PermissionDenied(detail=error_msg)

            primary_adult = validated_data.get('primary_adult', False)
            if primary_adult:
                # We can only have one primary adult record per family at a given time:
                for rec in AdultFamilyRelationship.objects.filter(family=family):
                    if rec.primary_adult:
                        rec.primary_adult = False
                        rec.save()
            else:
                if instance.primary_adult:
                    # We can't simply uncheck the primary adult box - the family must always have exactly one.
                    error_msg = "A family must always have exactly one primary adult. To remove this adult's " \
                                "status as primary, assign the primary status to a different adult linked to this " \
                                "family."
                    raise ValidationError(error_msg)

            validated_data['modified_by'] = request.user
            return super(AdultFamilyRelationshipSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class ChildFamilyRelationshipSerializer(serializers.ModelSerializer):

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = ChildFamilyRelationship

        fields = (
            'child_family_relationship_id',
            'child',
            'family',
            'ref_child_family_relationship_type',
            'relationship_begin_date',
            'relationship_end_date',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)

        if request is not None:
            if obj.child.person.organization.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() > 0:
                return False
            else:
                return True

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        """
        Creates a new ChildFamilyRelationship instance.

        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        if request:
            child = validated_data.get('child', None)
            if not child:
                raise ValidationError(detail="Child does not exist.")

            if child.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this child record."
                raise PermissionDenied(detail=error_msg)

            family = validated_data.get('family', None)
            if not family:
                raise ValidationError(detail="Family does not exist.")

            if family.organizations.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() == 0:
                raise PermissionDenied(detail='Write permissions are required for this family record.')

            ref_child_family_relationship_type = validated_data.get('ref_child_family_relationship_type', None)
            if ref_child_family_relationship_type:
                if not ref_child_family_relationship_type.universal:
                    if ref_child_family_relationship_type.organization not in \
                            Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this relationship type selection."
                        raise PermissionDenied(detail=error_msg)

            # We want only one link per person per family:
            if ChildFamilyRelationship.objects.filter(family=family).filter(child=child).count() > 0:
                raise ValidationError(detail="The supplied child is already linked to this family")

            return ChildFamilyRelationship.objects.create(
                child=child,
                family=family,
                ref_child_family_relationship_type=ref_child_family_relationship_type,
                relationship_begin_date=validated_data.get('relationship_begin_date', None),
                relationship_end_date=validated_data.get('relationship_end_date', None),
                created_by=request.user
            )

    def update(self, instance, validated_data):
        """
        Updates an existing instance of ChildFamilyRelationship.

        :param instance:
        :param validated_data:
        :return:
        """
        request = self.context.get('request', None)
        view = self.context.get('view')

        if request:
            # Does the user have write permissions for this instance?
            if instance.child.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this adult record."
                raise PermissionDenied(detail=error_msg)

            child = validated_data.get('child', None)
            if not child:
                raise ValidationError(detail="Child does not exist.")

            if child.person.organization.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions are required for this child record."
                raise PermissionDenied(detail=error_msg)

            family = validated_data.get('family', None)
            if not family:
                raise ValidationError(detail="Family does not exist.")

            if family.organizations.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() == 0:
                raise PermissionDenied(detail='Write permissions are required for this family record.')

            ref_child_family_relationship_type = validated_data.get('ref_child_family_relationship_type', None)
            if ref_child_family_relationship_type:
                if not ref_child_family_relationship_type.universal:
                    if ref_child_family_relationship_type.organization not in \
                            Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for this relationship type selection."
                        raise PermissionDenied(detail=error_msg)

            validated_data['modified_by'] = request.user
            return super(ChildFamilyRelationshipSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")
