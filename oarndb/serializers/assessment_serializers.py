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

from django.contrib.auth.models import User, Group

from rest_framework import serializers, status
from rest_framework.exceptions import ValidationError, PermissionDenied

from oarndb.serializers import BaseSerializer

from oarndb.models import Organization
from oarndb.models import RefAssessmentInterval
from oarndb.models import RefMaritalStatus
from oarndb.models import RefEmployment
from oarndb.models import RefGrossMonthlyIncome
from oarndb.models import RefSizeOfFamily
from oarndb.models import RefEmergencyServices
from oarndb.models import RefFrequencyScale
from oarndb.models import RefReadingFrequency
from oarndb.models import RefStrengthsScale
from oarndb.models import RefSmokeExposureScale
from oarndb.models import RefQualityScale
from oarndb.models import RefFrequencyTwoScale

from oarndb.models import RefYesNoDk
from oarndb.models import RefAsqScreeningAge
from oarndb.models import RefAsqseScreeningAge
from oarndb.models import RefAsqseDevStatus
from oarndb.models import RefImmunizationStatus
from oarndb.models import RefChildHeight
from oarndb.models import RefChildWeight
from oarndb.models import RefPrenatalCare

from oarndb.models import RefASQInterval, RefASQSEInterval

from oarndb.models import FamilyAssessment
from oarndb.models import ChildAssessment
from oarndb.models import RiskFactorAssessment
from oarndb.models import ASQ, ASQSE


class RefAssessmentIntervalSerializer(BaseSerializer):
    """
    Defines the monthly intervals at which the core assessments are completed
    """
    class Meta:
        model = RefAssessmentInterval
        fields = (
            'ref_assessment_interval_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefMaritalStatusSerializer(BaseSerializer):
    """
    Family Assessment, question 7: PC marital status
    [Married, Separated, Divorced, Widowed, Female live-in partner, Never married, Male live-in partner]
    """

    class Meta:
        model = RefMaritalStatus
        fields = (
            'ref_marital_status_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefEmploymentSerializer(BaseSerializer):
    """
    Family Assessment, question 8: PC employment (if on parental leave, status to which PC will return)
    [Employed full time (30 hrs/week or more), Employed seasonally, Not employed, not seeking work,
    Employed part time, Not employed, actively seeking work]
    """

    class Meta:
        model = RefEmployment
        fields = (
            'ref_employment_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefGrossMonthlyIncomeSerializer(BaseSerializer):
    """
    Family Assessment, question 10: Gross monthly family income
    [Under $400, $651 – 1,000, $1,501 – 2,000, $2,501 – 3,000, $400 – 650, $1,001 – 1,500, $2,001 – 2,500, $3,001 plus]
    """

    class Meta:
        model = RefGrossMonthlyIncome
        fields = (
            'ref_gross_monthly_income_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefSizeOfFamilySerializer(BaseSerializer):
    """
    Family Assessment, question 11: Size of family supported by income
    [1, 2, 3, 4, 5, 6, 7, 8, 9 or more]
    """

    class Meta:
        model = RefSizeOfFamily
        fields = (
            'ref_size_of_family_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefEmergencyServicesSerializer(BaseSerializer):
    """
    Family Assessment, question 14: How frequently has the family used emergency services for routine health care
    in the past 6 months?
    [Frequently, Once or twice, Has not used emergency services for routine care]
    """

    class Meta:
        model = RefEmergencyServices
        fields = (
            'ref_emergency_services_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefFrequencyScaleSerializer(BaseSerializer):
    """
    The scale used in the family functioning section, among others, of the family assessment
    [Not at this time, Seldom Sometimes, Most of the time, Almost always]
    """

    class Meta:
        model = RefFrequencyScale
        fields = (
            'ref_frequency_scale_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefFrequencyScaleTwoSerializer(BaseSerializer):
    """
    The scale used in the family functioning section, among others, of the family assessment, and includes 'NA'
    [NA, Not at this time, Seldom, Sometimes, Most of the time, Almost always]
    """

    class Meta:
        model = RefFrequencyTwoScale
        fields = (
            'ref_frequency_two_scale_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefReadingFrequencySerializer(BaseSerializer):
    """
    Family Assessment, question 21: How often does the parent read to the child at least 15 minutes?
    [Less than once a week, Once per week, Several times per week, Daily or more]
    """

    class Meta:
        model = RefReadingFrequency
        fields = (
            'ref_reading_frequency_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefStrengthsScaleSerializer(BaseSerializer):
    """
    The scale used in question 23 of the family assessment: Rate strengths for the parent(s) at this time
    [No, Seldom, Sometimes, Mostly, Almost Always]
    """

    class Meta:
        model = RefStrengthsScale
        fields = (
            'ref_strengths_scale_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefSmokeExposureScaleSerializer(BaseSerializer):
    """
    Family Assessment, question 32. Do the children receive passive smoke exposure (household member smokes)?
    [Yes, Occasional passive smoke exposure from sources outside home, such as visitors, No]
    """

    class Meta:
        model = RefSmokeExposureScale
        fields = (
            'ref_smoke_exposure_scale_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefQualityScaleSerializer(BaseSerializer):
    """
    A scale used in several questions in the Family Assessment
    [Poor, Fair, Good, Very good]
    """

    class Meta:
        model = RefQualityScale
        fields = (
            'ref_quality_scale_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefYesNoDkSerializer(BaseSerializer):
    """
    Used in the Child Assessment to allow Yes, No, and DK (Don't Know) selections.
    """

    class Meta:
        model = RefYesNoDk
        fields = (
            'ref_yes_no_dk_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefAsqScreeningAgeSerializer(BaseSerializer):
    """
    Used in the Child Assessment for question 16. The values are integers representing a child's age in months.
    """

    class Meta:
        model = RefAsqScreeningAge
        fields = (
            'ref_asq_screening_age_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefAsqseScreeningAgeSerializer(BaseSerializer):
    """
    Used in the Child Assessment for question 18. The values are integers representing a child's age in months.
    """

    class Meta:
        model = RefAsqseScreeningAge
        fields = (
            'ref_asqse_screening_age_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefAsqseDevStatusSerializer(BaseSerializer):
    """
    Used for the Child Assessment, question 19. [Normal, Delays Indicated]
    """

    class Meta:
        model = RefAsqseDevStatus
        fields = (
            'ref_asqse_dev_status_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefImmunizationStatusSerializer(BaseSerializer):
    """
    Indicates a child's immunization status:
    [Yes, Some but not all, No immunizations, parent declines, No immunizations due to lack of parent follow-through]
    """

    class Meta:
        model = RefImmunizationStatus
        fields = (
            'ref_immunization_status_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefChildHeightSerializer(BaseSerializer):
    """
    Used for Child Assessment question 22, indicating the height of the child:
    [25th percentile or less, 26th percentile or more]
    """

    class Meta:
        model = RefChildHeight
        fields = (
            'ref_child_height_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefChildWeightSerializer(BaseSerializer):
    """
    Used for Child Assessment question 23, indicating the child's weight:
    [5th percentile or less, 6th to 25th percentile or less, 26th to 95th percentile or above, 96th percentile or above]
    """

    class Meta:
        model = RefChildWeight
        fields = (
            'ref_child_weight_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefPrenatalCareSerializer(BaseSerializer):
    """
    Used for Child Assessment question 31:
    [Early comprehensive prenatal care, Inadequate prenatal care, No prenatal care, Unknown]
    """

    class Meta:
        model = RefPrenatalCare
        fields = (
            'ref_prenatal_care_id',
            'code',
            'description',
            'sort_order',
            'universal',
            'organization',
            'definition',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )


class RefASQIntervalSerializer(BaseSerializer):
    class Meta:

        read_only = read_only = serializers.SerializerMethodField('is_read_only')

        model = RefASQInterval
        fields = (
            'ref_asq_assessment_interval_id',
            'assessment_interval',
            'communication_cutoff_score',
            'gross_motor_cutoff_score',
            'fine_motor_cutoff_score',
            'problem_solving_cutoff_score',
            'personal_social_cutoff_score',
            'interval_month',
            'sort_order',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        return True # this is a read-only model


class RefASQSEIntervalSerializer(BaseSerializer):
    class Meta:

        read_only = read_only = serializers.SerializerMethodField('is_read_only')

        model = RefASQSEInterval
        fields = (
            'ref_asqse_assessment_interval_id',
            'assessment_interval',
            'cutoff_score',
            'interval_month',
            'sort_order',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        return True # this is a read-only model


class FamilyAssessmentSerializer(serializers.ModelSerializer):
    """
    The Family Assessment questions
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = FamilyAssessment
        fields = (
            'family_assessment_id',
            'ref_assessment_interval',
            'assessment_date',
            'family',
            'employee',
            'primary_caregiver',
            'secondary_caregiver',
            'q5_pc_lives_with_relatives',
            'q6_pc_attends_school',
            'q7_pc_marital_status',
            'q8_pc_employment',
            'q9_pc_has_primary_health_provider',
            'q10_gross_monthly_income',
            'q11_size_of_family',
            'q12_pc_education_no_high_school',
            'q13_family_member_has_health_insurance',
            'q14_emergency_services',
            'q16_sc_education_no_high_school',
            'q17_sc_employment',
            'q18_routine_responsibilities',
            'q19_positive_social_support',
            'q20_daily_routine',
            'q21_reading_frequency',
            'q22a_wic',
            'q22b_food_stamps',
            'q22c_food_bank',
            'q22d_tanf',
            'q22e_other_cash_assistance',
            'q22f_housing_assistance',
            'q22g_utility_assistance',
            'q22h_medicaid_ohp',
            'q22i_other_medical_insurance',
            'q22j_dental_insurance',
            'q22k_family_planning',
            'q22l_material_assistance',
            'q22m_legal_aid',
            'q22n_transportation_assistance',
            'q22o_child_care',
            'q22p_child_care_payment_assistance',
            'q22q_education_assistance',
            'q22r_esl_classes',
            'q22s_job_training',
            'q22t_a_d_counseling',
            'q22u_mental_health_counseling',
            'q22v_other',
            'q23a_pc_optimistic_outlook',
            'q23a_sc_optimistic_outlook',
            'q23b_pc_humor',
            'q23b_sc_humor',
            'q23c_pc_copes_effectively',
            'q23c_sc_copes_effectively',
            'q23d_pc_manages_anger',
            'q23d_sc_manages_anger',
            'q23e_pc_problem_solving',
            'q23e_sc_problem_solving',
            'q23f_pc_supportive_partner',
            'q23f_sc_supportive_partner',
            'q23g_pc_supportive_friends',
            'q23g_sc_supportive_friends',
            'q23h_pc_realistic_goals',
            'q23h_sc_realistic_goals',
            'q23i_pc_interested',
            'q23i_sc_interested',
            'q23j_pc_understands_child_needs',
            'q23j_sc_understands_child_needs',
            'q23k_pc_emotional_involvement',
            'q23k_sc_emotional_involvement',
            'q24_engage_actively',
            'q25_interested_in_advice',
            'q26_keep_appointments',
            'q27_reschedule_appointments',
            'q28_outside_clean',
            'q29_inside_clean',
            'q30_outside_safe',
            'q31_inside_safe',
            'q32_passive_smoke',
            'q33_overall_family_health',
            'q34_overall_family_nutrition',
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
        error_msg = "User has insufficient rights for this operation."

        if request is not None:
            if obj.family.organizations.filter(organization_id__in=Organization.objects.get_readwrite_orgs(
                    request.user)
            ).count() > 0:
                return False
            else:
                return True

            # Does the user have read access to the supplied staff person?
            employee = validated_data.get('employee', None)
            if employee:
                if employee.organization.filter(
                    organization_id__in=Organization.objects.get_read_orgs(request.user)
                ).count() == 0:
                    raise PermissionDenied(detail="Read access to the supplied employee is required.")
            else:
                raise ValidationError(detail="No employee was supplied.")

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for the supplied family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(FamilyAssessmentSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the instance?
            if instance.family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                    ).count() == 0:
                error_msg = "Write permissions are required for the family linked to this assessment."
                raise PermissionDenied(detail=error_msg)

            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for the supplied family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # If we've made it here, we can create the record:
            validated_data['modified_by'] = request.user
            return super(FamilyAssessmentSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class ChildAssessmentSerializer(serializers.ModelSerializer):
    """
    The Child Assessment questions
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = ChildAssessment
        fields = (
            'child_assessment_id',
            'ref_assessment_interval',
            'assessment_date',
            'family',
            'employee',
            'child',
            'q1_intake_foster_care',
            'q2_intake_dhs_report',
            'q2_intake_dhs_report_date',
            'q3_dhs_ep1_start_date',
            'q3_dhs_ep1_end_date',
            'q3_dhs_ep2_start_date',
            'q3_dhs_ep2_end_date',
            'q3_dhs_ep3_start_date',
            'q3_dhs_ep3_end_date',
            'q3_dhs_ep4_start_date',
            'q3_dhs_ep4_end_date',
            'q4_intake_dhs_report',
            'q4_intake_dhs_report_date',
            'q5_child_removed',
            'q6_dhs_ep1_start_date',
            'q6_dhs_ep1_end_date',
            'q6_dhs_ep2_start_date',
            'q6_dhs_ep2_end_date',
            'q6_dhs_ep3_start_date',
            'q6_dhs_ep3_end_date',
            'q6_dhs_ep4_start_date',
            'q6_dhs_ep4_end_date',
            'q7_enjoys_child',
            'q8_shows_sensitivity',
            'q9_loving_guidance',
            'q10_responds_appropriately',
            'q11_adjusts_environment',
            'q12_reciprocal_interactions',
            'q13_provides_encouragement',
            'q14_learning_environment',
            'q15_diagnosed_disability',
            'q15a_referred_to_ei',
            'q16_asq_screening_age',
            'q17_developmental_status',
            'q17_developmental_status_other',
            'q18_asqse_screening_age',
            'q19_asqse_dev_status',
            'q19_asqse_dev_status_other',
            'q20_further_evaluation',
            'q21_immunizations',
            'q22_height',
            'q23_weight',
            'q24_overall_health',
            'q25_special_health_needs',
            'q25_special_health_description',
            'q26_health_provider',
            'q27_mother_smoked',
            'q28_premature',
            'q29_underweight',
            'q30_breast_fed',
            'q31_prenatal_care',
            'comments',
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
        error_msg = "User has insufficient rights for this operation."

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

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for the supplied family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(ChildAssessmentSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the instance?
            if instance.family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                    ).count() == 0:
                error_msg = "Write permissions are required for the family linked to this assessment."
                raise PermissionDenied(detail=error_msg)

            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for the supplied family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # If we've made it here, we can create the record:
            validated_data['modified_by'] = request.user
            return super(ChildAssessmentSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class RiskFactorAssessmentSerializer(serializers.ModelSerializer):
    """
    The Risk Factor Assessment questions
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = RiskFactorAssessment
        fields = (
            'risk_factor_assessment_id',
            'ref_assessment_interval',
            'assessment_date',
            'family',
            'employee',
            'q1a_anger_management',
            'q1b_violent_partner',
            'q1c_incarcerated',
            'q2a_more_than_three_children',
            'q2b_provide_food',
            'q2c_homeless',
            'q2d_inadequate_supplies',
            'q2e_no_telephone',
            'q2f_below_poverty_level',
            'q2g_no_reliable_transportation',
            'q2h_unemployed',
            'q3a_child_neglected',
            'q3b_out_of_home_placement',
            'q3c_open_child_welfare_case',
            'q4a_high_stress',
            'q4b_child_mental_health',
            'q4c_parent_mental_health',
            'q4d_parent_low_self_esteem',
            'q5a_medical_disability',
            'q5b_child_developmental_disability',
            'q5c_parent_developmental_disability',
            'q5d_mother_pregnant',
            'q6a_language_difficulties',
            'q6b_divorced_caregivers',
            'q6c_lacks_support_system',
            'q6d_lacks_child_care',
            'q6e_minority',
            'q6f_new_domestic_partner',
            'q6g_single_parent_family',
            'q6h_multiple_birth',
            'q6i_untreated_substance_abuse',
            'q6j_treated_substance_abuse',
            'q6k_extreme_risk',
            'q6l_other',
            'q6m_other',
            'q7a_incarceration',
            'q7b_partner_violence',
            'q7c_homelessness',
            'q7d_unemployed',
            'q7e_limited_education',
            'q7f_unable_to_provide_food',
            'q7g_teen_parent',
            'q7h_mental_health_problems',
            'q7i_drug_affected',
            'q7j_open_child_welfare_case',
            'q7k_termination_of_parental_rights',
            'q7l_foster_care',
            'q7m_physical_abuse',
            'q7n_sexual_abuse',
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
        error_msg = "User has insufficient rights for this operation."

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

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for the supplied family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(RiskFactorAssessmentSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the instance?
            if instance.family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                    ).count() == 0:
                error_msg = "Write permissions are required for the family linked to this assessment."
                raise PermissionDenied(detail=error_msg)

            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for the supplied family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # If we've made it here, we can create the record:
            validated_data['modified_by'] = request.user
            return super(RiskFactorAssessmentSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class ASQSerializer(serializers.ModelSerializer):
    """
    The ASQ Assessment scores
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = ASQ

        fields = (
            'asq_id',
            'ref_assessment_interval',
            'assessment_date',
            'child',
            'family',
            'employee',
            'communication_score',
            'gross_motor_score',
            'fine_motor_score',
            'problem_solving_score',
            'personal_social_score',
            'concerns',
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
        error_msg = "User has insufficient rights for this operation."

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

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for the supplied family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(ASQSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the instance?
            if instance.family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                    ).count() == 0:
                error_msg = "Write permissions are required for the family linked to this assessment."
                raise PermissionDenied(detail=error_msg)

            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for the supplied family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # If we've made it here, we can create the record:
            validated_data['modified_by'] = request.user
            return super(ASQSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class ASQSESerializer(serializers.ModelSerializer):
    """
    The ASQ:SE Assessment scores
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = ASQSE

        fields = (
            'asqse_id',
            'ref_assessment_interval',
            'assessment_date',
            'child',
            'family',
            'employee',
            'score',
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
        error_msg = "User has insufficient rights for this operation."

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

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for the supplied family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(ASQSESerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the instance?
            if instance.family.organizations.filter(
                    organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                    ).count() == 0:
                error_msg = "Write permissions are required for the family linked to this assessment."
                raise PermissionDenied(detail=error_msg)

            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for the supplied family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # If we've made it here, we can create the record:
            validated_data['modified_by'] = request.user
            return super(ASQSESerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")