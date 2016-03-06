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

from django.db import models
from oarndb.models import BaseModel, RefModel

# We need a set of reference tables specific to this assessment to carry the acceptable answers to the
# different answers in an intelligent way.


class RefAssessmentInterval(RefModel):
    """
    The assessment intervals for the Family Assessment, Child Assessment, and Risk Factor Assessment
    """

    ref_assessment_interval_id = models.AutoField(
        'ref_assessment_interval_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_assessment_interval"


class RefMaritalStatus(RefModel):
    """
    Family Assessment, question 7: PC marital status
    [Married, Separated, Divorced, Widowed, Female live-in partner, Never married, Male live-in partner]
    """
    ref_marital_status_id = models.AutoField(
        'ref_marital_status_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_marital_status"


class RefEmployment(RefModel):
    """
    Family Assessment, question 8: PC employment (if on parental leave, status to which PC will return)
    [Employed full time (30 hrs/week or more), Employed seasonally, Not employed, not seeking work,
    Employed part time, Not employed, actively seeking work]
    """
    ref_employment_id = models.AutoField(
        'ref_employment_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_employment"
        

class RefGrossMonthlyIncome(RefModel):
    """
    Family Assessment, question 10: Gross monthly family income
    [Under $400, $651 – 1,000, $1,501 – 2,000, $2,501 – 3,000, $400 – 650, $1,001 – 1,500, $2,001 – 2,500, $3,001 plus]
    """
    ref_gross_monthly_income_id = models.AutoField(
        'ref_gross_monthly_income_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_gross_monthly_income"


class RefSizeOfFamily(RefModel):
    """
    Family Assessment, question 11: Size of family supported by income
    [1, 2, 3, 4, 5, 6, 7, 8, 9 or more]
    """
    ref_size_of_family_id = models.AutoField(
        'ref_size_of_family_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_size_of_family"


class RefEmergencyServices(RefModel):
    """
    Family Assessment, question 14: How frequently has the family used emergency services for routine health care
    in the past 6 months?
    [Frequently, Once or twice, Has not used emergency services for routine care]
    """

    ref_emergency_services_id = models.AutoField(
        'ref_emergency_services_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_emergency_services"


class RefFrequencyScale(RefModel):
    """
    The scale used in the family functioning section, among others, of the family assessment
    [Not at this time, Seldom, Sometimes, Most of the time, Almost always]
    """
    ref_frequency_scale_id = models.AutoField(
        'ref_frequency_scale_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_frequency_scale"


class RefFrequencyTwoScale(RefModel):
    """
    The scale used in the family functioning section, among others, of the family assessment, and includes 'NA'
    [NA, Not at this time, Seldom, Sometimes, Most of the time, Almost always]
    """
    ref_frequency_two_scale_id = models.AutoField(
        'ref_frequency_two_scale_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_frequency_two_scale"


class RefReadingFrequency(RefModel):
    """
    Family Assessment, question 21: How often does the parent read to the child at least 15 minutes?
    [Less than once a week, Once per week, Several times per week, Daily or more]
    """
    ref_reading_frequency_id = models.AutoField(
        'ref_reading_frequency_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_reading_frequency"


class RefStrengthsScale(RefModel):
    """
    The scale used in question 23 of the family assessment: Rate strengths for the parent(s) at this time
    [No, Seldom, Sometimes, Mostly, Almost Always]
    """
    ref_strengths_scale_id = models.AutoField(
        'ref_strengths_scale_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_strengths_scale"


class RefSmokeExposureScale(RefModel):
    """
    Family Assessment, question 32. Do the children receive passive smoke exposure (household member smokes)?
    [Yes, Occasional passive smoke exposure from sources outside home, such as visitors, No]
    """
    ref_smoke_exposure_scale_id = models.AutoField(
        'ref_smoke_exposure_scale_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_smoke_exposure_scale"


class RefQualityScale(RefModel):
    """
    A scale used in several questions in the Family Assessment
    [Poor, Fair, Good, Very good]
    """
    ref_quality_scale_id = models.AutoField(
        'ref_quality_scale_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_quality_scale"


class RefYesNoDk(RefModel):
    """
    Used in the Child Assessment to allow Yes, No, and DK (Don't Know) selections.
    """
    ref_yes_no_dk_id = models.AutoField(
        'ref_yes_no_dk_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_yes_no_dk"


class RefAsqScreeningAge(RefModel):
    """
    Used in the Child Assessment for question 16. The values are integers representing a child's age in months.
    """
    ref_asq_screening_age_id = models.AutoField(
        'ref_asq_screening_age_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_asq_screening_age"


class RefAsqseScreeningAge(RefModel):
    """
    Used in the Child Assessment for question 18. The values are integers representing a child's age in months.
    """
    ref_asqse_screening_age_id = models.AutoField(
        'ref_asqse_screening_age_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_asqse_screening_age"


class RefAsqseDevStatus(RefModel):
    """
    Used for the Child Assessment, question 19. [Normal, Delays Indicated]
    """
    ref_asqse_dev_status_id = models.AutoField(
        'ref_asqse_dev_status_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_asqse_dev_status"


class RefImmunizationStatus(RefModel):
    """
    Indicates a child's immunization status:
    [Yes, Some but not all, No immunizations, parent declines, No immunizations due to lack of parent follow-through]
    """
    ref_immunization_status_id = models.AutoField(
        'ref_immunization_status_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_immunization_status"


class RefChildHeight(RefModel):
    """
    Used for Child Assessment question 22, indicating the height of the child:
    [25th percentile or less, 26th percentile or more]
    """
    ref_child_height_id = models.AutoField(
        'ref_child_height_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_child_height"


class RefChildWeight(RefModel):
    """
    Used for Child Assessment question 23, indicating the child's weight:
    [5th percentile or less, 6th to 25th percentile or less, 26th to 95th percentile or above, 96th percentile or above]
    """
    ref_child_weight_id = models.AutoField(
        'ref_child_weight_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_child_weight"


class RefPrenatalCare(RefModel):
    """
    Used for Child Assessment question 31:
    [Early comprehensive prenatal care, Inadequate prenatal care, No prenatal care, Unknown]
    """
    ref_prenatal_care_id = models.AutoField(
        'ref_prenatal_care_id',
        primary_key=True
    )

    class Meta:
        db_table = "ref_prenatal_care"


class RiskFactorAssessment(BaseModel):
    """
    The Risk Factor Assessment (baseline and follow-up)
    """

    risk_factor_assessment_id = models.AutoField(
        'risk_factor_assessment_id',
        primary_key=True
    )

    ref_assessment_interval = models.ForeignKey(
        'RefAssessmentInterval',
        verbose_name='ref_assessment_interval_id'
    )

    assessment_date = models.DateField('assessment_date', auto_now=False, auto_now_add=False)

    family = models.ForeignKey('Family', verbose_name='family', related_name='risk_factor_family')

    employee = models.ForeignKey("Person", related_name="risk_factor_employees")

    q1a_anger_management = models.BooleanField(default=False)

    q1b_violent_partner = models.BooleanField(default=False)

    q1c_incarcerated = models.BooleanField(default=False)

    q2a_more_than_three_children = models.BooleanField(default=False)

    q2b_provide_food = models.BooleanField(default=False)

    q2c_homeless = models.BooleanField(default=False)

    q2d_inadequate_supplies = models.BooleanField(default=False)

    q2e_no_telephone = models.BooleanField(default=False)

    q2f_below_poverty_level = models.BooleanField(default=False)

    q2g_no_reliable_transportation = models.BooleanField(default=False)

    q2h_unemployed = models.BooleanField(default=False)

    q3a_child_neglected = models.BooleanField(default=False)

    q3b_out_of_home_placement = models.BooleanField(default=False)

    q3c_open_child_welfare_case = models.BooleanField(default=False)

    q4a_high_stress = models.BooleanField(default=False)

    q4b_child_mental_health = models.BooleanField(default=False)

    q4c_parent_mental_health = models.BooleanField(default=False)

    q4d_parent_low_self_esteem = models.BooleanField(default=False)

    q5a_medical_disability = models.BooleanField(default=False)

    q5b_child_developmental_disability = models.BooleanField(default=False)

    q5c_parent_developmental_disability = models.BooleanField(default=False)

    q5d_mother_pregnant = models.BooleanField(default=False)

    q6a_language_difficulties = models.BooleanField(default=False)

    q6b_divorced_caregivers = models.BooleanField(default=False)

    q6c_lacks_support_system = models.BooleanField(default=False)

    q6d_lacks_child_care = models.BooleanField(default=False)

    q6e_minority = models.BooleanField(default=False)

    q6f_new_domestic_partner = models.BooleanField(default=False)

    q6g_single_parent_family = models.BooleanField(default=False)

    q6h_multiple_birth = models.BooleanField(default=False)

    q6i_untreated_substance_abuse = models.BooleanField(default=False)

    q6j_treated_substance_abuse = models.BooleanField(default=False)

    q6k_extreme_risk = models.BooleanField(default=False)

    q6l_other = models.CharField(max_length=50, null=True, blank=True)

    q6m_other = models.CharField(max_length=50, null=True, blank=True)

    # Historical risk factors (intake only):

    q7a_incarceration = models.BooleanField(default=False)

    q7b_partner_violence = models.BooleanField(default=False)

    q7c_homelessness = models.BooleanField(default=False)

    q7d_unemployed = models.BooleanField(default=False)

    q7e_limited_education = models.BooleanField(default=False)

    q7f_unable_to_provide_food = models.BooleanField(default=False)

    q7g_teen_parent = models.BooleanField(default=False)

    q7h_mental_health_problems = models.BooleanField(default=False)

    q7i_drug_affected = models.BooleanField(default=False)

    q7j_open_child_welfare_case = models.BooleanField(default=False)

    q7k_termination_of_parental_rights = models.BooleanField(default=False)

    q7l_foster_care = models.BooleanField(default=False)

    q7m_physical_abuse = models.BooleanField(default=False)

    q7n_sexual_abuse = models.BooleanField(default=False)

    class Meta:
        db_table = "risk_factor_assessment"


class ChildAssessment(BaseModel):
    """
    The Child Assessment form
    """

    child_assessment_id = models.AutoField(
        'child_assessment_id',
        primary_key=True
    )

    ref_assessment_interval = models.ForeignKey(
        'RefAssessmentInterval',
        verbose_name='ref_assessment_interval_id'
    )

    assessment_date = models.DateField('assessment_date', auto_now=False, auto_now_add=False)

    family = models.ForeignKey('Family', verbose_name='family', related_name='child_assessment_family')

    employee = models.ForeignKey("Person", related_name="child_assessment_employees")

    child = models.ForeignKey('Child', verbose_name='child', related_name='child_assessment_child')

    q1_intake_foster_care = models.BooleanField(default=False)

    q2_intake_dhs_report = models.BooleanField(default=False)

    q2_intake_dhs_report_date = models.DateField('q2_intake_dhs_report_date', auto_now=False, auto_now_add=False,
                                                 null=True, blank=True)

    q3_dhs_ep1_start_date = models.DateField('q3_dhs_ep1_start_date', auto_now=False, auto_now_add=False,
                                             null=True, blank=True)

    q3_dhs_ep1_end_date = models.DateField('q3_dhs_ep1_end_date', auto_now=False, auto_now_add=False,
                                           null=True, blank=True)

    q3_dhs_ep2_start_date = models.DateField('q3_dhs_ep2_start_date', auto_now=False, auto_now_add=False,
                                             null=True, blank=True)

    q3_dhs_ep2_end_date = models.DateField('q3_dhs_ep2_end_date', auto_now=False, auto_now_add=False,
                                           null=True, blank=True)

    q3_dhs_ep3_start_date = models.DateField('q3_dhs_ep3_start_date', auto_now=False, auto_now_add=False,
                                             null=True, blank=True)

    q3_dhs_ep3_end_date = models.DateField('q3_dhs_ep3_end_date', auto_now=False, auto_now_add=False,
                                           null=True, blank=True)

    q3_dhs_ep4_start_date = models.DateField('q3_dhs_ep4_start_date', auto_now=False, auto_now_add=False,
                                             null=True, blank=True)

    q3_dhs_ep4_end_date = models.DateField('q3_dhs_ep4_end_date', auto_now=False, auto_now_add=False,
                                           null=True, blank=True)

    q4_intake_dhs_report = models.BooleanField(default=False)

    q4_intake_dhs_report_date = models.DateField('q2_intake_dhs_report_date', auto_now=False, auto_now_add=False,
                                                 null=True, blank=True)

    q5_child_removed = models.BooleanField(default=False)

    q6_dhs_ep1_start_date = models.DateField('q6_dhs_ep1_start_date', auto_now=False, auto_now_add=False,
                                             null=True, blank=True)

    q6_dhs_ep1_end_date = models.DateField('q6_dhs_ep1_end_date', auto_now=False, auto_now_add=False,
                                           null=True, blank=True)

    q6_dhs_ep2_start_date = models.DateField('q6_dhs_ep2_start_date', auto_now=False, auto_now_add=False,
                                             null=True, blank=True)

    q6_dhs_ep2_end_date = models.DateField('q6_dhs_ep2_end_date', auto_now=False, auto_now_add=False,
                                           null=True, blank=True)

    q6_dhs_ep3_start_date = models.DateField('q6_dhs_ep3_start_date', auto_now=False, auto_now_add=False,
                                             null=True, blank=True)

    q6_dhs_ep3_end_date = models.DateField('q6_dhs_ep3_end_date', auto_now=False, auto_now_add=False,
                                           null=True, blank=True)

    q6_dhs_ep4_start_date = models.DateField('q6_dhs_ep4_start_date', auto_now=False, auto_now_add=False,
                                             null=True, blank=True)

    q6_dhs_ep4_end_date = models.DateField('q6_dhs_ep4_end_date', auto_now=False, auto_now_add=False,
                                           null=True, blank=True)

    q7_enjoys_child = models.ForeignKey('RefFrequencyScale', related_name='enjoys_child',
                                        null=True, on_delete=models.SET_NULL)

    q8_shows_sensitivity = models.ForeignKey('RefFrequencyScale', related_name='shows_sensitivity',
                                             null=True, on_delete=models.SET_NULL)

    q9_loving_guidance = models.ForeignKey('RefFrequencyScale', related_name='loving_guidance',
                                           null=True, on_delete=models.SET_NULL)

    q10_responds_appropriately = models.ForeignKey('RefFrequencyScale', related_name='responds_appropriately',
                                                   null=True, on_delete=models.SET_NULL)

    q11_adjusts_environment = models.ForeignKey('RefFrequencyScale', related_name='adjusts_environment',
                                                null=True, on_delete=models.SET_NULL)

    q12_reciprocal_interactions = models.ForeignKey('RefFrequencyScale', related_name='reciprocal_interactions',
                                                    null=True, on_delete=models.SET_NULL)

    q13_provides_encouragement = models.ForeignKey('RefFrequencyScale', related_name='provides_encouragement',
                                                   null=True, on_delete=models.SET_NULL)

    q14_learning_environment = models.ForeignKey('RefFrequencyScale', related_name='learning_environment',
                                                 null=True, on_delete=models.SET_NULL)

    q15_diagnosed_disability = models.ForeignKey('RefYesNoDk', related_name='diagnosed_disability',
                                                 null=True, on_delete=models.SET_NULL)

    q15a_referred_to_ei = models.ForeignKey('RefYesNoDk', related_name='referred_to_ei',
                                          null=True, on_delete=models.SET_NULL)

    q16_asq_screening_age = models.ForeignKey('RefAsqScreeningAge', related_name='asq_screening_age',
                                              null=True, on_delete=models.SET_NULL)

    q17_developmental_status = models.ForeignKey('RefAsqseDevStatus', related_name='developmental_status',
                                                 null=True, on_delete=models.SET_NULL)

    q17_developmental_status_other = models.CharField(max_length=50, null=True, blank=True)

    q18_asqse_screening_age = models.ForeignKey('RefAsqseScreeningAge', related_name='asqse_screening_age',
                                                null=True, on_delete=models.SET_NULL)

    q19_asqse_dev_status = models.ForeignKey('RefAsqseDevStatus', related_name='asqse_dev_status',
                                             null=True, on_delete=models.SET_NULL)

    q19_asqse_dev_status_other = models.CharField(max_length=50, null=True, blank=True)

    q20_further_evaluation = models.BooleanField(default=False)

    q21_immunizations = models.ForeignKey('RefImmunizationStatus', related_name='immunizations',
                                          null=True, on_delete=models.SET_NULL)

    q22_height = models.ForeignKey('RefChildHeight', related_name='height',
                                   null=True, on_delete=models.SET_NULL)

    q23_weight = models.ForeignKey('RefChildWeight', related_name='weight',
                                   null=True, on_delete=models.SET_NULL)

    q23_obesity_concern = models.BooleanField(default=False)

    q24_overall_health = models.ForeignKey('RefQualityScale', related_name='overall_health',
                                           null=True, on_delete=models.SET_NULL)

    q25_special_health_needs = models.ForeignKey('RefYesNoDk', related_name='special_health_needs',
                                                 null=True, on_delete=models.SET_NULL)

    q25_special_health_description = models.CharField(max_length=50, null=True, blank=True)

    q26_health_provider = models.ForeignKey('RefYesNoDk', related_name='health_provider',
                                            null=True, on_delete=models.SET_NULL)

    q27_mother_smoked = models.ForeignKey('RefYesNoDk', related_name='mother_smoked',
                                          null=True, on_delete=models.SET_NULL)

    q28_premature = models.ForeignKey('RefYesNoDk', related_name='premature',
                                      null=True, on_delete=models.SET_NULL)

    q29_underweight = models.ForeignKey('RefYesNoDk', related_name='underweight',
                                        null=True, on_delete=models.SET_NULL)

    q30_breast_fed = models.ForeignKey('RefYesNoDk', related_name='breast_fed',
                                       null=True, on_delete=models.SET_NULL)

    q31_prenatal_care = models.ForeignKey('RefPrenatalCare', related_name='prenatal_care',
                                          null=True, on_delete=models.SET_NULL)

    comments = models.CharField(max_length=5000, null=True, blank=True)

    class Meta:
        db_table = "child_assessment"


class FamilyAssessment(BaseModel):
    """
    The Family Assessment form
    """

    family_assessment_id = models.AutoField(
        'family_assessment_id',
        primary_key=True
    )

    ref_assessment_interval = models.ForeignKey(
        'RefAssessmentInterval',
        verbose_name='ref_assessment_interval_id'
    )

    assessment_date = models.DateField('assessment_date', auto_now=False, auto_now_add=False)

    family = models.ForeignKey('Family', verbose_name='family', related_name='family')

    employee = models.ForeignKey("Person", related_name="family_assessment_employees")

    primary_caregiver = models.ForeignKey('Adult', related_name='primary_caregiver')

    secondary_caregiver = models.ForeignKey('Adult', related_name='secondary_caregiver', null=True, blank=True)

    q5_pc_lives_with_relatives = models.BooleanField(default=False)

    q6_pc_attends_school = models.BooleanField(default=False)

    q7_pc_marital_status = models.ForeignKey('RefMaritalStatus', related_name='pc_marital_status',
                                              null=True, on_delete=models.SET_NULL)

    q8_pc_employment = models.ForeignKey('RefEmployment', related_name='pc_employment',
                                          null=True, on_delete=models.SET_NULL)

    q9_pc_has_primary_health_provider = models.BooleanField(default=False)

    q10_gross_monthly_income = models.ForeignKey('RefGrossMonthlyIncome', related_name='gross_monthly_income',
                                                  null=True, on_delete=models.SET_NULL)

    q11_size_of_family = models.ForeignKey('RefSizeOfFamily', related_name='size_of_family',
                                            null=True, on_delete=models.SET_NULL)

    q12_pc_education_no_high_school = models.BooleanField(default=False)

    q13_family_member_has_health_insurance = models.BooleanField(default=False)

    q14_emergency_services = models.ForeignKey('RefEmergencyServices', related_name='emergency_services',
                                                null=True, on_delete=models.SET_NULL)

    q16_sc_education_no_high_school = models.BooleanField(default=False)

    q17_sc_employment = models.ForeignKey('RefEmployment', related_name='sc_employment',
                                           null=True, on_delete=models.SET_NULL)

    q18_routine_responsibilities = models.ForeignKey('RefFrequencyScale', related_name='routine_responsibilities',
                                                      null=True, on_delete=models.SET_NULL)

    q19_positive_social_support = models.ForeignKey('RefFrequencyScale', related_name='positive_social_support',
                                                     null=True, on_delete=models.SET_NULL)

    q20_daily_routine = models.ForeignKey('RefFrequencyScale', related_name='daily_routine',
                                           null=True, on_delete=models.SET_NULL)

    q21_reading_frequency = models.ForeignKey('RefReadingFrequency', related_name='reading_frequency',
                                               null=True, on_delete=models.SET_NULL)

    q22a_wic = models.BooleanField(default=False)

    q22b_food_stamps = models.BooleanField(default=False)

    q22c_food_bank = models.BooleanField(default=False)

    q22d_tanf = models.BooleanField(default=False)

    q22e_other_cash_assistance = models.BooleanField(default=False)

    q22f_housing_assistance = models.BooleanField(default=False)

    q22g_utility_assistance = models.BooleanField(default=False)

    q22h_medicaid_ohp = models.BooleanField(default=False)

    q22i_other_medical_insurance = models.BooleanField(default=False)

    q22j_dental_insurance = models.BooleanField(default=False)

    q22k_family_planning = models.BooleanField(default=False)

    q22l_material_assistance = models.BooleanField(default=False)

    q22m_legal_aid = models.BooleanField(default=False)

    q22n_transportation_assistance = models.BooleanField(default=False)

    q22o_child_care = models.BooleanField(default=False)

    q22p_child_care_payment_assistance = models.BooleanField(default=False)

    q22q_education_assistance = models.BooleanField(default=False)

    q22r_esl_classes = models.BooleanField(default=False)

    q22s_job_training = models.BooleanField(default=False)

    q22t_a_d_counseling = models.BooleanField(default=False)

    q22u_mental_health_counseling = models.BooleanField(default=False)

    q22v_other = models.CharField(max_length=50, null=True, blank=True)

    q23a_pc_optimistic_outlook = models.ForeignKey('RefStrengthsScale', related_name='pc_optimistic_outlook',
                                                   null=True, on_delete=models.SET_NULL)

    q23a_sc_optimistic_outlook = models.ForeignKey('RefStrengthsScale', related_name='sc_optimistic_outlook',
                                                   null=True, on_delete=models.SET_NULL)

    q23b_pc_humor = models.ForeignKey('RefStrengthsScale', related_name='pc_humor',
                                      null=True, on_delete=models.SET_NULL)

    q23b_sc_humor = models.ForeignKey('RefStrengthsScale', related_name='sc_humor',
                                       null=True, on_delete=models.SET_NULL)

    q23c_pc_copes_effectively = models.ForeignKey('RefStrengthsScale', related_name='pc_copes_effectively',
                                                   null=True, on_delete=models.SET_NULL)

    q23c_sc_copes_effectively = models.ForeignKey('RefStrengthsScale', related_name='sc_copes_effectively',
                                                   null=True, on_delete=models.SET_NULL)

    q23d_pc_manages_anger = models.ForeignKey('RefStrengthsScale', related_name='pc_manages_anger',
                                               null=True, on_delete=models.SET_NULL)

    q23d_sc_manages_anger = models.ForeignKey('RefStrengthsScale', related_name='sc_manages_anger',
                                               null=True, on_delete=models.SET_NULL)

    q23e_pc_problem_solving = models.ForeignKey('RefStrengthsScale', related_name='pc_problem_solving',
                                                 null=True, on_delete=models.SET_NULL)

    q23e_sc_problem_solving = models.ForeignKey('RefStrengthsScale', related_name='sc_problem_solving',
                                                 null=True, on_delete=models.SET_NULL)

    q23f_pc_supportive_partner = models.ForeignKey('RefStrengthsScale', related_name='pc_supportive_partner',
                                                    null=True, on_delete=models.SET_NULL)

    q23f_sc_supportive_partner = models.ForeignKey('RefStrengthsScale', related_name='sc_supportive_partner',
                                                    null=True, on_delete=models.SET_NULL)

    q23g_pc_supportive_friends = models.ForeignKey('RefStrengthsScale', related_name='pc_supportive_friends',
                                                    null=True, on_delete=models.SET_NULL)

    q23g_sc_supportive_friends = models.ForeignKey('RefStrengthsScale', related_name='sc_supportive_friends',
                                                    null=True, on_delete=models.SET_NULL)

    q23h_pc_realistic_goals = models.ForeignKey('RefStrengthsScale', related_name='pc_realistic_goals',
                                                 null=True, on_delete=models.SET_NULL)

    q23h_sc_realistic_goals = models.ForeignKey('RefStrengthsScale', related_name='sc_realistic_goals',
                                                 null=True, on_delete=models.SET_NULL)

    q23i_pc_interested = models.ForeignKey('RefStrengthsScale', related_name='pc_interested',
                                            null=True, on_delete=models.SET_NULL)

    q23i_sc_interested = models.ForeignKey('RefStrengthsScale', related_name='sc_interested',
                                            null=True, on_delete=models.SET_NULL)

    q23j_pc_understands_child_needs = models.ForeignKey('RefStrengthsScale', related_name='pc_understands_child_needs',
                                                         null=True, on_delete=models.SET_NULL)

    q23j_sc_understands_child_needs = models.ForeignKey('RefStrengthsScale', related_name='sc_understands_child_needs',
                                                         null=True, on_delete=models.SET_NULL)

    q23k_pc_emotional_involvement = models.ForeignKey('RefStrengthsScale', related_name='pc_emotional_involvement',
                                                       null=True, on_delete=models.SET_NULL)

    q23k_sc_emotional_involvement = models.ForeignKey('RefStrengthsScale', related_name='sc_emotional_involvement',
                                                       null=True, on_delete=models.SET_NULL)

    q24_engage_actively = models.ForeignKey('RefFrequencyScale', related_name='engage_actively',
                                             null=True, on_delete=models.SET_NULL)

    q25_interested_in_advice = models.ForeignKey('RefFrequencyTwoScale', related_name='interested_in_advice',
                                                  null=True, on_delete=models.SET_NULL)

    q26_keep_appointments = models.ForeignKey('RefFrequencyTwoScale', related_name='keep_appointments',
                                               null=True, on_delete=models.SET_NULL)

    q27_reschedule_appointments = models.ForeignKey('RefFrequencyTwoScale', related_name='reschedule_appointments',
                                                     null=True, on_delete=models.SET_NULL)

    q28_outside_clean = models.ForeignKey('RefFrequencyScale', related_name='outside_clean',
                                           null=True, on_delete=models.SET_NULL)

    q29_inside_clean = models.ForeignKey('RefFrequencyScale', related_name='inside_clean',
                                          null=True, on_delete=models.SET_NULL)

    q30_outside_safe = models.ForeignKey('RefFrequencyScale', related_name='outside_safe',
                                          null=True, on_delete=models.SET_NULL)

    q31_inside_safe = models.ForeignKey('RefFrequencyScale', related_name='inside_safe',
                                         null=True, on_delete=models.SET_NULL)

    q32_passive_smoke = models.ForeignKey('RefSmokeExposureScale', related_name='passive_smoke',
                                           null=True, on_delete=models.SET_NULL)

    q33_overall_family_health = models.ForeignKey('RefQualityScale', related_name='overall_family_health',
                                                   null=True, on_delete=models.SET_NULL)

    q34_overall_family_nutrition = models.ForeignKey('RefQualityScale', related_name='overall_family_nutrition',
                                                      null=True, on_delete=models.SET_NULL)

    class Meta:
        db_table = "family_assessment"


class RefASQInterval(BaseModel):
    """
    The assessment intervals for the ASQ 3 are combined with a specific cutoff score for each category.
    Unlike other reference tables, RefASQInterval does not use the description/code/universal fields.
    It is instead simply read-only and universal.
    """
    ref_asq_assessment_interval_id = models.AutoField(
        'ref_asq_assessment_interval_id',
        primary_key=True
    )

    assessment_interval = models.CharField(
        'assessment_interval',
        max_length=100,
        null=False
    )

    communication_cutoff_score = models.DecimalField(
        'communication_cutoff_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    gross_motor_cutoff_score = models.DecimalField(
        'gross_motor_cutoff_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    fine_motor_cutoff_score = models.DecimalField(
        'fine_motor_cutoff_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    problem_solving_cutoff_score = models.DecimalField(
        'problem_solving_cutoff_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    personal_social_cutoff_score = models.DecimalField(
        'problem_solving_cutoff_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    interval_month = models.IntegerField(
        'interval_month',
        null=False
    )

    sort_order = models.DecimalField(
        'sort_order',
        max_digits=5,
        decimal_places=2,
        null=False
    )

    class Meta:
        db_table = "ref_asq_assessment_interval"


class RefASQSEInterval(BaseModel):
    """
    The assessment intervals for the ASQSE are combined with a specific cutoff score.
    Unlike other reference tables, RefASQSEInterval does not use the description/code/universal fields.
    It is instead simply read-only and universal.
    """
    ref_asqse_assessment_interval_id = models.AutoField(
        'ref_asqse_assessment_interval_id',
        primary_key=True
    )

    assessment_interval = models.CharField(
        'assessment_interval',
        max_length=100,
        null=False
    )

    cutoff_score = models.DecimalField(
        'communication_cutoff_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    interval_month = models.IntegerField(
        'interval_month',
        null=False
    )

    sort_order = models.DecimalField(
        'sort_order',
        max_digits=5,
        decimal_places=2,
        null=False
    )

    class Meta:
        db_table = 'ref_asqse_assessment_interval'


class ASQSE(BaseModel):
    """
    Describes the ASQ:SE assessment score (no questions)
    """
    asqse_id = models.AutoField(
        'asq_id',
        primary_key=True
    )

    ref_assessment_interval = models.ForeignKey(
        'RefASQSEInterval',
        verbose_name='ref_assessment_interval_id'
    )

    assessment_date = models.DateField('assessment_date', auto_now=False, auto_now_add=False)

    child = models.ForeignKey('Child', verbose_name='child', related_name='asqse_children')

    family = models.ForeignKey('Family', verbose_name='family', related_name='asqse_family')

    employee = models.ForeignKey("Person", related_name="asqse_employees")

    score = models.IntegerField('score', null=False)

    notes = models.CharField('notes', max_length=5000, null=True, blank=True)

    class Meta:
        db_table = "asqse"


class ASQ(BaseModel):
    """
    Describes the ASQ 3 assessment scores (no questions)
    """
    
    asq_id = models.AutoField(
        'asq_id',
        primary_key=True
    )

    ref_assessment_interval = models.ForeignKey(
        'RefASQInterval',
        verbose_name='ref_assessment_interval_id'
    )

    assessment_date = models.DateField('assessment_date', auto_now=False, auto_now_add=False)

    child = models.ForeignKey('Child', verbose_name='child', related_name='asq_children')

    family = models.ForeignKey('Family', verbose_name='family', related_name='asq_family')

    employee = models.ForeignKey("Person", related_name="asq_employees")
    
    communication_score = models.DecimalField(
        'communication_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    gross_motor_score = models.DecimalField(
        'gross_motor_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    fine_motor_score = models.DecimalField(
        'fine_motor_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    problem_solving_score = models.DecimalField(
        'problem_solving_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    personal_social_score = models.DecimalField(
        'problem_solving_score',
        null=False,
        max_digits=3,
        decimal_places=1
    )

    concerns = models.CharField(max_length=5000, null=True, blank=True)

    class Meta:
        db_table = "asq"