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

from django.db.models import Q
from django.http import Http404
from rest_framework import permissions, generics
from rest_framework.exceptions import PermissionDenied
from oarndb.views import base_views

from oarndb.models import Organization, FamilyAssessment, ChildAssessment, RiskFactorAssessment
from oarndb.models import RefASQInterval, RefASQSEInterval, ASQ, ASQSE

from oarndb.serializers import FamilyAssessmentSerializer
from oarndb.serializers import ChildAssessmentSerializer
from oarndb.serializers import RiskFactorAssessmentSerializer
from oarndb.serializers import ASQSerializer, ASQSESerializer

from oarndb.serializers import RefAssessmentIntervalSerializer
from oarndb.serializers import RefMaritalStatusSerializer
from oarndb.serializers import RefEmploymentSerializer
from oarndb.serializers import RefGrossMonthlyIncomeSerializer
from oarndb.serializers import RefSizeOfFamilySerializer
from oarndb.serializers import RefEmergencyServicesSerializer
from oarndb.serializers import RefFrequencyScaleSerializer
from oarndb.serializers import RefReadingFrequencySerializer
from oarndb.serializers import RefStrengthsScaleSerializer
from oarndb.serializers import RefSmokeExposureScaleSerializer
from oarndb.serializers import RefQualityScaleSerializer
from oarndb.serializers import RefFrequencyScaleTwoSerializer
from oarndb.serializers import RefYesNoDkSerializer
from oarndb.serializers import RefAsqScreeningAgeSerializer
from oarndb.serializers import RefAsqseScreeningAgeSerializer
from oarndb.serializers import RefAsqseDevStatusSerializer
from oarndb.serializers import RefImmunizationStatusSerializer
from oarndb.serializers import RefChildHeightSerializer
from oarndb.serializers import RefChildWeightSerializer
from oarndb.serializers import RefPrenatalCareSerializer
from oarndb.serializers import RefASQIntervalSerializer
from oarndb.serializers import RefASQSEIntervalSerializer


class FamilyAssessmentList(generics.ListCreateAPIView):
    """
    A list of Family Assessments.
    Read/create access is determined by the user's access to the related family record, with
    read access also required for the employee field. At this time, each reference field is
    universally accessible to authenticated users.
    """
    serializer_class = FamilyAssessmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return FamilyAssessment.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('family', 'assessment_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            if family_id_filter:
                return FamilyAssessment.objects.filter(family__family_id=family_id_filter).filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', 'assessment_date')
            else:
                # We need to return the default so that pagination doesn't break
                return FamilyAssessment.objects.filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', 'assessment_date')


class FamilyAssessmentDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    A single Family Assessment.
    Read/create access is determined by the user's access to the related family record, with
    read access also required for the employee field. At this time, each reference field is
    universally accessible to authenticated users.
    """
    serializer_class = FamilyAssessmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return FamilyAssessment.objects.filter(
            family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('family', 'assessment_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = FamilyAssessment.objects.get(pk=kwargs.get('pk', None))
        except FamilyAssessment.DoesNotExist:
            raise Http404

        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this assessment record."
            raise PermissionDenied(detail=error_msg)

        return super(FamilyAssessmentDetail, self).delete(self, request, *args, **kwargs)


class ChildAssessmentList(generics.ListCreateAPIView):
    """
    A list of Child Assessments.
    Read/create access is determined by the user's access to the related family record, with
    read access also required for the employee field. At this time, each reference field is
    universally accessible to authenticated users.
    """
    serializer_class = ChildAssessmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return ChildAssessment.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('family', 'assessment_date')
        else:
            child_id_filter = self.request.query_params.get('child_id', None)
            if child_id_filter:
                return ChildAssessment.objects.filter(child=child_id_filter).filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', 'assessment_date')
            else:
                # We need to return the default so that pagination doesn't break
                return ChildAssessment.objects.filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', 'assessment_date')


class ChildAssessmentDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    A single Child Assessment.
    Read/create access is determined by the user's access to the related family record, with
    read access also required for the employee field. At this time, each reference field is
    universally accessible to authenticated users.
    """
    serializer_class = ChildAssessmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ChildAssessment.objects.filter(
            family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('family', 'assessment_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = ChildAssessment.objects.get(pk=kwargs.get('pk', None))
        except ChildAssessment.DoesNotExist:
            raise Http404

        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this assessment record."
            raise PermissionDenied(detail=error_msg)

        return super(ChildAssessmentDetail, self).delete(self, request, *args, **kwargs)


class RiskFactorAssessmentList(generics.ListCreateAPIView):
    """
    A list of Risk Factor Assessments.
    Read/create access is determined by the user's access to the related family record, with
    read access also required for the employee field.
    """
    serializer_class = RiskFactorAssessmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return RiskFactorAssessment.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('family', 'assessment_date')
        else:
            family_id_filter = self.request.query_params.get('family_id', None)
            if family_id_filter:
                return RiskFactorAssessment.objects.filter(family__family_id=family_id_filter).filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', 'assessment_date')
            else:
                # We need to return the default so that pagination doesn't break
                return RiskFactorAssessment.objects.filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', 'assessment_date')


class RiskFactorAssessmentDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    A single Risk Factor Assessment.
    Read/create access is determined by the user's access to the related family record, with
    read access also required for the employee field.
    """
    serializer_class = RiskFactorAssessmentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return RiskFactorAssessment.objects.filter(
            family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('family', 'assessment_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = RiskFactorAssessment.objects.get(pk=kwargs.get('pk', None))
        except FamilyAssessment.DoesNotExist:
            raise Http404

        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this assessment record."
            raise PermissionDenied(detail=error_msg)

        return super(RiskFactorAssessmentDetail, self).delete(self, request, *args, **kwargs)


class ASQList(generics.ListCreateAPIView):
    """
    A list of ASQ scores.
    Read/create access is determined by the user's access to the related family record, with
    read access also required for the employee field.
    """
    serializer_class = ASQSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return ASQ.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('family', 'assessment_date')
        else:
            child_id_filter = self.request.query_params.get('child_id', None)
            if child_id_filter:
                return ASQ.objects.filter(child=child_id_filter).filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', 'assessment_date')
            else:
                # We need to return the default so that pagination doesn't break
                return ASQ.objects.filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', 'assessment_date')


class ASQDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    A set of ASQ scores.
    Read/create access is determined by the user's access to the related family record, with
    read access also required for the employee field.
    """
    serializer_class = ASQSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ASQ.objects.filter(
            family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('family', 'assessment_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = ASQ.objects.get(pk=kwargs.get('pk', None))
        except ASQ.DoesNotExist:
            raise Http404

        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this assessment record."
            raise PermissionDenied(detail=error_msg)

        return super(ASQDetail, self).delete(self, request, *args, **kwargs)


class ASQSEList(generics.ListCreateAPIView):
    """
    A list of ASQ:SE scores.
    Read/create access is determined by the user's access to the related family record, with
    read access also required for the employee field.
    """
    serializer_class = ASQSESerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return ASQSE.objects.filter(
                family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('family', 'assessment_date')
        else:
            child_id_filter = self.request.query_params.get('child_id', None)
            if child_id_filter:
                return ASQSE.objects.filter(child=child_id_filter).filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', 'assessment_date')
            else:
                # We need to return the default so that pagination doesn't break
                return ASQSE.objects.filter(
                    family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('family', 'assessment_date')


class ASQSEDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    A set of ASQ:SE scores.
    Read/create access is determined by the user's access to the related family record, with
    read access also required for the employee field.
    """
    serializer_class = ASQSESerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ASQSE.objects.filter(
            family__organizations__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('family', 'assessment_date')

    def delete(self, request, *args, **kwargs):
        try:
            obj = ASQSE.objects.get(pk=kwargs.get('pk', None))
        except ASQSE.DoesNotExist:
            raise Http404

        if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(self.request.user)
        ).count() == 0:
            error_msg = "Write permissions for this family are required to delete this assessment record."
            raise PermissionDenied(detail=error_msg)

        return super(ASQSEDetail, self).delete(self, request, *args, **kwargs)


class AssessmentIntervalList(base_views.ListCreateAPIView):
    """
    A list of valid assessment intervals for the Family Assessment, Child Assessment, and Risk Factors Assessment.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """
    serializer_class = RefAssessmentIntervalSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AssessmentIntervalDetail(base_views.ListCreateAPIView):
    """
    Describes a single, valid assessment interval for the Family Assessment, Child Assessment,
    and Risk Factors Assessment.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """
    serializer_class = RefAssessmentIntervalSerializer

    permission_classes = (permissions.IsAuthenticated,)


class MaritalStatusList(base_views.ListCreateAPIView):
    """
    A list of valid choices for the Family Assessment, question 7: PC marital status.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefMaritalStatusSerializer

    permission_classes = (permissions.IsAuthenticated,)


class MaritalStatusDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for the Family Assessment, question 7: PC marital status.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefMaritalStatusSerializer

    permission_classes = (permissions.IsAuthenticated,)


class EmploymentList(base_views.ListCreateAPIView):
    """
    A list of valid choices for the Family Assessment, question 8: PC employment
    (if on parental leave, status to which PC will return)

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefEmploymentSerializer

    permission_classes = (permissions.IsAuthenticated,)


class EmploymentDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for the Family Assessment, question 8: PC employment
    (if on parental leave, status to which PC will return)

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefEmploymentSerializer

    permission_classes = (permissions.IsAuthenticated,)


class GrossMonthlyIncomeList(base_views.ListCreateAPIView):
    """
    A list of valid choices for the Family Assessment, question 10: Gross monthly family income

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefGrossMonthlyIncomeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class GrossMonthlyIncomeDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for the Family Assessment, question 10: Gross monthly family income

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefGrossMonthlyIncomeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class SizeOfFamilyList(base_views.ListCreateAPIView):
    """
    A list of valid choices for the Family Assessment, question 11: Size of family supported by income

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefSizeOfFamilySerializer

    permission_classes = (permissions.IsAuthenticated,)


class SizeOfFamilyDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for the Family Assessment, question 11: Size of family supported by income

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefSizeOfFamilySerializer

    permission_classes = (permissions.IsAuthenticated,)


class EmergencyServicesList(base_views.ListCreateAPIView):
    """
    A list of valid choices for the Family Assessment, question 14: How frequently has the family used
    emergency services for routine health care in the past 6 months?

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefEmergencyServicesSerializer

    permission_classes = (permissions.IsAuthenticated,)


class EmergencyServicesDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for the Family Assessment, question 14: How frequently has the family
    used emergency services for routine health care in the past 6 months?

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefEmergencyServicesSerializer

    permission_classes = (permissions.IsAuthenticated,)


class FrequencyScaleList(base_views.ListCreateAPIView):
    """
    A list of valid choices for a frequency scale used in several sections of the Family Assessment.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefFrequencyScaleSerializer

    permission_classes = (permissions.IsAuthenticated,)


class FrequencyScaleDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for a frequency scale used in several sections of the Family Assessment.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefFrequencyScaleSerializer

    permission_classes = (permissions.IsAuthenticated,)


class FrequencyScaleTwoList(base_views.ListCreateAPIView):
    """
    A list of valid choices for a frequency scale used in several sections of the Family Assessment.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefFrequencyScaleTwoSerializer

    permission_classes = (permissions.IsAuthenticated,)


class FrequencyScaleTwoDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for a frequency scale used in several sections of the Family Assessment.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefFrequencyScaleTwoSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ReadingFrequencyList(base_views.ListCreateAPIView):
    """
    A list of valid choices for the Family Assessment, question 21: How often does the parent read
    to the child at least 15 minutes?

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefReadingFrequencySerializer

    permission_classes = (permissions.IsAuthenticated,)


class ReadingFrequencyDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for the Family Assessment, question 21: How often does the parent read
    to the child at least 15 minutes?

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefReadingFrequencySerializer

    permission_classes = (permissions.IsAuthenticated,)


class StrengthsScaleList(base_views.ListCreateAPIView):
    """
    A list of valid choices for question 23 of the Family Assessment: Rate strengths for the parent(s) at this time

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefStrengthsScaleSerializer

    permission_classes = (permissions.IsAuthenticated,)


class StrengthsScaleDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for question 23 of the Family Assessment: Rate strengths for the
    parent(s) at this time

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefStrengthsScaleSerializer

    permission_classes = (permissions.IsAuthenticated,)


class SmokeExposureScaleList(base_views.ListCreateAPIView):
    """
    A list of valid choices for the Family Assessment, question 32. Do the children receive passive smoke
    exposure (household member smokes)?

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefSmokeExposureScaleSerializer

    permission_classes = (permissions.IsAuthenticated,)


class SmokeExposureScaleDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for the Family Assessment, question 32. Do the children receive passive
    smoke exposure (household member smokes)?

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefSmokeExposureScaleSerializer

    permission_classes = (permissions.IsAuthenticated,)


class QualityScaleList(base_views.ListCreateAPIView):
    """
    A list of valid choices for a scale used in several questions on the Family Assessment.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefQualityScaleSerializer

    permission_classes = (permissions.IsAuthenticated,)


class QualityScaleDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Describes a single valid choice for a scale used in several questions on the Family Assessment.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefQualityScaleSerializer

    permission_classes = (permissions.IsAuthenticated,)


class PrenatalCareList(base_views.ListCreateAPIView):
    """
    Used for Child Assessment question 31:
    [Early comprehensive prenatal care, Inadequate prenatal care, No prenatal care, Unknown]

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefPrenatalCareSerializer

    permission_classes = (permissions.IsAuthenticated,)


class PrenatalCareDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Used for Child Assessment question 31:
    [Early comprehensive prenatal care, Inadequate prenatal care, No prenatal care, Unknown]

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefPrenatalCareSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ChildWeightList(base_views.ListCreateAPIView):
    """
    Used for Child Assessment question 23, indicating the child's weight:
    [5th percentile or less, 6th to 25th percentile or less, 26th to 95th percentile or above, 96th percentile or above]

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefChildWeightSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ChildWeightDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Used for Child Assessment question 23, indicating the child's weight:
    [5th percentile or less, 6th to 25th percentile or less, 26th to 95th percentile or above, 96th percentile or above]

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefChildWeightSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ChildHeightList(base_views.ListCreateAPIView):
    """
    Used for Child Assessment question 22, indicating the height of the child:
    [25th percentile or less, 26th percentile or more]

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefChildHeightSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ChildHeightDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Used for Child Assessment question 22, indicating the height of the child:
    [25th percentile or less, 26th percentile or more]

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefChildHeightSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ImmunizationStatusList(base_views.ListCreateAPIView):
    """
    Indicates a child's immunization status:
    [Yes, Some but not all, No immunizations, parent declines, No immunizations due to lack of parent follow-through]

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefImmunizationStatusSerializer

    permission_classes = (permissions.IsAuthenticated,)


class ImmunizationStatusDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Indicates a child's immunization status:
    [Yes, Some but not all, No immunizations, parent declines, No immunizations due to lack of parent follow-through]

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefImmunizationStatusSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AsqseDevStatusList(base_views.ListCreateAPIView):
    """
    Used for the Child Assessment, question 19. [Normal, Delays Indicated]

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefAsqseDevStatusSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AsqseDevStatusDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Used for the Child Assessment, question 19. [Normal, Delays Indicated]

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefAsqseDevStatusSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AsqScreeningAgeList(base_views.ListCreateAPIView):
    """
    Used in the Child Assessment for question 16. The values are integers representing a child's age in months.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefAsqScreeningAgeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AsqScreeningAgeDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Used in the Child Assessment for question 16. The values are integers representing a child's age in months.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefAsqScreeningAgeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AsqseScreeningAgeList(base_views.ListCreateAPIView):
    """
    Used in the Child Assessment for question 18. The values are integers representing a child's age in months.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefAsqseScreeningAgeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AsqseScreeningAgeDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Used in the Child Assessment for question 18. The values are integers representing a child's age in months.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefAsqseScreeningAgeSerializer

    permission_classes = (permissions.IsAuthenticated,)


class YesNoDkList(base_views.ListCreateAPIView):
    """
    Used in the Child Assessment to allow Yes, No, and DK (Don't Know) selections.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefYesNoDkSerializer

    permission_classes = (permissions.IsAuthenticated,)


class YesNoDkDetail(base_views.RetrieveUpdateDestroyAPIView):
    """
    Used in the Child Assessment to allow Yes, No, and DK (Don't Know) selections.

    Validation:
    - Either universal must be true or an organization must be supplied, but not both.
    - Setting universal to true requires membership in the global_admin group.
    - Setting the organization requires membership in global_admin or that organization's admin group.
    - The description, code, and sort_order fields are required.
    """

    serializer_class = RefYesNoDkSerializer

    permission_classes = (permissions.IsAuthenticated,)


class AsqIntervalList(generics.ListAPIView):
    """
    This is a read-only reference model that is universally accessible. It includes the intervals and
    cutoff scores for the ASQ 3 assessment.
    """
    serializer_class = RefASQIntervalSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return RefASQInterval.objects.all().order_by('sort_order')


class AsqIntervalDetail(generics.RetrieveAPIView):
    """
    This is a read-only reference model that is universally accessible. It includes the intervals and
    cutoff scores for the ASQ 3 assessment.
    """
    serializer_class = RefASQIntervalSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return RefASQInterval.objects.all().order_by('sort_order')


class AsqseIntervalList(generics.ListAPIView):
    """
    This is a read-only reference model that is universally accessible. It includes the intervals and
    cutoff scores for the ASQ:SE assessment.
    """
    serializer_class = RefASQSEIntervalSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return RefASQSEInterval.objects.all().order_by('sort_order')


class AsqseIntervalDetail(generics.RetrieveAPIView):
    """
    This is a read-only reference model that is universally accessible. It includes the intervals and
    cutoff scores for the ASQ:SE assessment.
    """
    serializer_class = RefASQSEIntervalSerializer

    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return RefASQSEInterval.objects.all().order_by('sort_order')