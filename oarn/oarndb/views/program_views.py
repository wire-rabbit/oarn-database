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
from rest_framework import permissions, generics
from rest_framework.exceptions import PermissionDenied

from oarndb.models import CaseManager, Organization, Person, Family, FamilyEnrollment, PersonEnrollment
from oarndb.models import ServiceLevelEnrollment
from oarndb.serializers import CaseManagerSerializer, CaseManagerCreateSerializer, CaseManagerModelSerializer
from oarndb.serializers import FamilyEnrollmentSerializer, PersonEnrollmentSerializer, ServiceLevelEnrollmentSerializer
from oarndb.serializers import FamilyEnrollmentReadOnlySerializer


class FamilyEnrollmentList(generics.ListCreateAPIView):
    """
    Defines the enrollment status of a family in a given program. The open date is required, but the close date
    is optional (if missing, it indicates that the family is still enrolled). Read/write access is determined by
    the read/write access of the user to the family. Read access to the supplied program is required for create
    and update operations.
    """

    serializer_class = FamilyEnrollmentSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return FamilyEnrollment.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('-open_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            if family_id_filter:
                return FamilyEnrollment.objects.filter(family__family_id=family_id_filter).filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('-open_date')
            else:
                # We need to return the default so that pagination doesn't break
                return FamilyEnrollment.objects.filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('-open_date')


class FamilyEnrollmentDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Defines the enrollment status of a family in a given program. The open date is required, but the close date
    is optional (if missing, it indicates that the family is still enrolled). Read/write access is determined by
    the read/write access of the user to the family. Read access to the supplied program is required for create
    and update operations. A side effect of changing ref_program is the deletion of related ServiceLevelEnrollment
    records - this is to prevent impossible values there (e.g., An Outreach enrollment record is created, an
    Intensive service level record is created, linked to that program, and then the program is changed to
    Therapeutic Classroom, which would give us intensive classroom services, which do not exist.)
    """

    serializer_class = FamilyEnrollmentSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return FamilyEnrollment.objects.filter(
            family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('-open_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = FamilyEnrollment.objects.get(pk=kwargs.get('pk', None))
        except FamilyEnrollment.DoesNotExist:
            raise Http404

        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this program record."
            raise PermissionDenied(detail=error_msg)

        return super(FamilyEnrollmentDetail, self).delete(self, request, *args, **kwargs)


class CaseManagerList(generics.ListAPIView):

    serializer_class = CaseManagerSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):

        if len(self.request.query_params) == 0:
            # Return only those records for which the user has read rights to both the person and the family.
            return CaseManager.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).filter(family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                     ).order_by('family', '-begin_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            if family_id_filter:
                return CaseManager.objects.filter(
                    person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family__organizations__in=Organization.objects.get_read_orgs(self.request.user)).filter(
                    family__family_id=family_id_filter
                ).order_by('-begin_date')
            else:
                # We need to return the default so that pagination doesn't break
                return CaseManager.objects.filter(
                    person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                         ).order_by('family', '-begin_date')


class CaseManagerDetail(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = CaseManagerModelSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Return only those records for which the user has read rights to both the person and the family.
        return CaseManager.objects.filter(
            person__organization__in=Organization.objects.get_read_orgs(self.request.user)
        ).filter(family__organizations__in=Organization.objects.get_read_orgs(self.request.user))

    def delete(self, request, *args, **kwargs):
        try:
            obj = CaseManager.objects.get(pk=kwargs.get('pk', None))
        except CaseManager.DoesNotExist:
            raise Http404

        # Does this user have write access to both the person and the family?
        if obj.person.organization.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                error_msg = "Write permissions for this person record are required to delete this case manager record."
                raise PermissionDenied(detail=error_msg)

        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:

                error_msg = "Write permissions for this family record are required to delete this case manager record."
                raise PermissionDenied(detail=error_msg)

        return super(CaseManagerDetail, self).delete(self, request, *args, **kwargs)


class CaseManagerCreate(generics.CreateAPIView):

    serializer_class = CaseManagerCreateSerializer

    permission_classes = (permissions.IsAuthenticated,)


class PersonEnrollmentList(generics.ListCreateAPIView):
    """
    Defines individual participation for a family receiving services. If a family is enrolled in Outreach,
    for example (defined in FamilyEnrollment), PersonEnrollment would tell us which adults and children
    are receiving those services. Access is determined by the user's access to both the family and the person.
    """

    serializer_class = PersonEnrollmentSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return PersonEnrollment.objects.filter(
                family_enrollment__family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('family_enrollment', 'person', '-open_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            family_enrollment_id_filter = self.request.query_params.get('family_enrollment_id', None)
            if family_id_filter:
                return PersonEnrollment.objects.filter(
                    family_enrollment__family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family_enrollment__family__family_id=family_id_filter).order_by(
                    'family_enrollment', 'person', '-open_date')
            elif family_enrollment_id_filter:
                return PersonEnrollment.objects.filter(
                    family_enrollment__family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family_enrollment__family_enrollment_id=family_enrollment_id_filter).order_by(
                    'family_enrollment', 'person', '-open_date')
            else:
                # We need to return the default so that pagination doesn't break
                return PersonEnrollment.objects.filter(
                    family_enrollment__family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family_enrollment', 'person', '-open_date')


class PersonEnrollmentDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Defines individual participation for a family receiving services. If a family is enrolled in Outreach,
    for example (defined in FamilyEnrollment), PersonEnrollment would tell us which adults and children
    are receiving those services. Access is determined by the user's access to both the family and the person.
    """

    serializer_class = PersonEnrollmentSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return PersonEnrollment.objects.filter(
            family_enrollment__family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
        )

    def delete(self, request, *args, **kwargs):
        try:
            obj = PersonEnrollment.objects.get(pk=kwargs.get('pk', None))
        except PersonEnrollment.DoesNotExist:
            raise Http404

        if obj.person.organization.filter(
            organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this person are required to delete this program record."
            raise PermissionDenied(detail=error_msg)

        if obj.family_enrollment.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this program record."
            raise PermissionDenied(detail=error_msg)

        return super(PersonEnrollmentDetail, self).delete(self, request, *args, **kwargs)


class ServiceLevelEnrollmentList(generics.ListCreateAPIView):
    """
    Some programs have different levels of service. Outreach, for example, may be basic or intensive at
    some agencies. Access is determined by the user's access to the family.
    """

    serializer_class = ServiceLevelEnrollmentSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return ServiceLevelEnrollment.objects.filter(
                family_enrollment__family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('family_enrollment','-open_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            family_enrollment_id_filter = self.request.query_params.get('family_enrollment_id', None)
            if family_id_filter:
                return ServiceLevelEnrollment.objects.filter(
                    family_enrollment__family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family_enrollment__family__family_id=family_id_filter).order_by(
                    'family_enrollment', '-open_date')
            elif family_enrollment_id_filter:
                return ServiceLevelEnrollment.objects.filter(
                    family_enrollment__family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(family_enrollment__family_enrollment_id=family_enrollment_id_filter).order_by(
                    'family_enrollment','-open_date')
            else:
                # We need to return the default so that pagination doesn't break
                return ServiceLevelEnrollment.objects.filter(
                    family_enrollment__family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family_enrollment', '-open_date')


class ServiceLevelEnrollmentDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Some programs have different levels of service. Outreach, for example, may be basic or intensive at
    some agencies. Access is determined by the user's access to the family.
    """

    serializer_class = ServiceLevelEnrollmentSerializer

    permission_classes = (permissions.IsAuthenticated, )

    def get_queryset(self):
        return ServiceLevelEnrollment.objects.filter(
            family_enrollment__family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
        )

    def delete(self, request, *args, **kwargs):
        try:
            obj = ServiceLevelEnrollment.objects.get(pk=kwargs.get('pk', None))
        except ServiceLevelEnrollment.DoesNotExist:
            raise Http404

        if obj.family_enrollment.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this service level record."
            raise PermissionDenied(detail=error_msg)

        return super(ServiceLevelEnrollmentDetail, self).delete(self, request, *args, **kwargs)


class FamilyEnrollmentReadOnlyList(generics.ListAPIView):
    """
    Provides a read-only, but complete view into a given family's enrollment situation. The main
    purpose is to allow front-ends to interact with relationships between the different levels
    (e.g., if the program changes it impacts service levels and may justify a warning). The read_only
    field indicates whether at the manipulable end-points the user will have write access (again, mainly
    for front-end use).
    """

    serializer_class = FamilyEnrollmentReadOnlySerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return FamilyEnrollment.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('-open_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            if family_id_filter:
                return FamilyEnrollment.objects.filter(family__family_id=family_id_filter).filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('-open_date')
            else:
                # We need to return the default so that pagination doesn't break
                return FamilyEnrollment.objects.filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('-open_date')