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
        db_table = "ref_strengths_scale_id"


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

    q25_interested_in_advice = models.ForeignKey('RefFrequencyScale', related_name='interested_in_advice',
                                                  null=True, on_delete=models.SET_NULL)

    q26_keep_appointments = models.ForeignKey('RefFrequencyScale', related_name='keep_appointments',
                                               null=True, on_delete=models.SET_NULL)

    q27_reschedule_appointments = models.ForeignKey('RefFrequencyScale', related_name='reschedule_appointments',
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