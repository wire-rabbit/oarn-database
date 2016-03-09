//  The OARN Relief Nursery Database
//  Copyright (C) 2015  Oregon Association of Relief Nurseries
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Affero General Public License as
//  published by the Free Software Foundation, either version 3 of the
//  License, or (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU Affero General Public License for more details.
//
//  You should have received a copy of the GNU Affero General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.

(function (enyo, scope){

	enyo.kind({
		name: 'oarn.RiskFactorAssessmentDetails',

        published: {
            token: '',
            dirty: false,
            selectedFamilyID: -1,
            selectedRiskFactorAssessmentID: -1,
            currentOrgReadOnly: false
        },

        components: [
            {name: 'repeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px 5px 5px 5px;'},
            {name: 'riskFactorAssessmentQuestions',
                kind: 'oarn.AssessmentGenerator',
                maxWidth: '600px',
                showing: false,
                style: 'padding: 5px 5px 5px 5px;'
            },
            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
            {name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        events: {
            onRiskFactorAssessmentDirtyStateChanged: ''
        },

        handlers: {
            onRowSelected: 'rowSelectedHandler',
            onPopupClosed: 'popupClosedHandler',
            onRowDeleted: 'rowDeletedHandler',
            onDirtyStateChanged: 'dirtyStateChangedHandler'
        },

        bindings: [
            {from: '.token', to: '.$.repeaterDisplay.token'},
            {from: '.token', to: '.$.riskFactorAssessmentQuestions.token'},
            {from: '.selectedRiskFactorAssessmentID', to: '.$.riskFactorAssessmentQuestions.assessmentID'},
            {from: '.currentOrgReadOnly', to: '.$.riskFactorAssessmentQuestions.currentOrgReadOnly'}
        ],

        observers: [
            {method: 'isReady', path: ['selectedFamilyID', 'selectedOrganization']}
        ],

        /**
         * Wait for selectedFamilyID and selectedOrganization to be set before building controls.
         *
         * @private
         */
        isReady: function (previous, current, property) {
            if (this.get('.selectedFamilyID') != -1 && (this.get('selectedOrganization') != null)) {
                this.defineRepeaterDisplay();
            }
        },

        defineRepeaterDisplay: function () {
            this.$.repeaterDisplay.set('.groupboxHeaderText', 'Risk Factor Assessments');
            this.$.repeaterDisplay.set('.newRecordHeaderText', 'New Risk Factor Assessment');
            this.$.repeaterDisplay.set('.hasSimpleSelectButton', true);

            this.$.repeaterDisplay.selectEndpoints = [
                {
                    endpoint: 'api/v1/ref/assessment-intervals/',
                    name: 'intervals',
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/program/family/person/?staff_only=true&limit=500&organization_id=' +
                        this.get('.selectedOrganization.organization_id'),
                    name: 'employees',
                    parseWith: this.$.selectHelper.parsePerson
                },
                {
                    endpoint: 'api/v1/family/adult-search/?family_id_strict=' + this.get('.selectedFamilyID'),
                    name: 'adults',
                    parseWith: this.$.selectHelper.parsePerson
                }
            ];

            this.$.repeaterDisplay.staticPostFields = [
                {fieldName: 'family', value: this.get('.selectedFamilyID')}
            ];

            this.$.repeaterDisplay.fields = [
                {
                    fieldName: 'family',
                    postBodyOnly: true
                },
                {
                    fieldName: 'risk_factor_assessment_id',
                    postBodyOnly: true,
                    primaryKey: true
                },
                {
                    fieldName: 'ref_assessment_interval',
                    fieldType: 'DataSelect',
                    dataSelectName: 'intervals',
                    headerText: 'Assessment Interval',
                    labelText: 'Assessment Interval',
                    fieldWidth: 100
                },
                {
                    fieldName: 'employee',
                    fieldType: 'DataSelect',
                    dataSelectName: 'employees',
                    headerText: 'Interviewer',
                    labelText: 'Interviewer',
                    fieldWidth: 175
                },
                {
                    fieldName: 'assessment_date',
                    fieldType: 'DatePicker',
                    headerText: 'Assessment Date',
                    labelText: 'Assessment Date',
                    fieldWidth: 125,
                    emptyIsValid: false
                }

            ];

            this.$.repeaterDisplay.endpoint = 'api/v1/assessments/risk-factor-assessments/?family_id=' +
                this.get('.selectedFamilyID');
            this.$.repeaterDisplay.patchEndpoint = 'api/v1/assessments/risk-factor-assessments/';
            this.$.repeaterDisplay.postEndpoint = 'api/v1/assessments/risk-factor-assessments/';
            this.$.repeaterDisplay.deleteEndpoint = 'api/v1/assessments/risk-factor-assessments/';

            this.$.repeaterDisplay.allowsNewRecords = !(this.get('.currentOrgReadOnly'));

            this.$.repeaterDisplay.set('maxWidth', 600);

            this.$.repeaterDisplay.createRepeater();

            this.set('.repeaterInitialized', true);
        },

        rowSelectedHandler: function (inSender, inEvent) {
            var collection = this.$.repeaterDisplay.getCollection();
            var list = this.$.repeaterDisplay.getOptionsList('intervals_options_list');

            if (collection.at(inEvent.index).get('risk_factor_assessment_id') !=
                this.get('.selectedRiskFactorAssessmentID') &&
                this.$.riskFactorAssessmentQuestions.dirty) {

                var msg = 'You appear to have unsaved changes to the selected assessment. ' +
                    'Clicking \'Yes\' will change the selected assessment and your unsaved changes will be' +
                    ' lost. Continue anyway?';

                this.set('.targetID', collection.at(inEvent.index).get('risk_factor_assessment_id'));
                this.set('.targetIndex', inEvent.index);
                this.set('confirmPopupMode', 'confirmMove');
                this.$.popupFactory.showConfirm('Unsaved Changes', msg);
            }
            else if (collection.at(inEvent.index).get('risk_factor_assessment_id') !=
                this.get('.selectedRiskFactorAssessmentID') &&
                !this.$.riskFactorAssessmentQuestions.dirty) {

                var htext = 'none';
                for (var i = 0; i < list.length; i++) {
                    if (list[i].value == collection.at(inEvent.index).get('ref_assessment_interval')) {
                        htext = 'Risk Factor Assessment ' +
                            collection.at(inEvent.index).get('risk_factor_assessment_id') + ': ' +
                            list[i].display_text;
                        break;
                    }
                }
                this.set('.selectedRiskFactorAssessmentID',
                    this.$.repeaterDisplay.collection.at(inEvent.index).get('risk_factor_assessment_id')
                );

                this.set('.$.riskFactorAssessmentQuestions.groupboxHeaderText', htext);
                this.set('.currentIndex', inEvent.index);
            }
        },

        rowDeletedHandler: function (inSender, inEvent) {
            if (this.get('.currentIndex') == inEvent.index) {
                this.$.riskFactorAssessmentQuestions.hide();
            }
            return true;
        },

        popupClosedHandler: function (inSender, inEvent) {
            if (this.get('.confirmPopupMode') == 'confirmMove') {
                if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
                    return true; // we only want to take action if a confirmation has occurred
                }
                else if (inEvent.confirmed) {
                    this.$.riskFactorAssessmentQuestions.setDirty(false);
                    var collection = this.$.repeaterDisplay.getCollection();
                    var list = this.$.repeaterDisplay.getOptionsList('intervals_options_list');

                    var htext = 'none';
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].value == collection.at(this.get('.targetIndex')).get('ref_assessment_interval')) {
                            htext = 'Risk Factor Assessment ' +
                                collection.at(this.get('.targetIndex')).get('risk_factor_assessment_id') + ': ' +
                                list[i].display_text;
                            break;
                        }
                    }
                    this.set('.selectedRiskFactorAssessmentID', this.get('.targetID'));

                    this.set('.$.riskFactorAssessmentQuestions.groupboxHeaderText', htext);

                }
                this.set('.confirmPopupMode', '');
                return true;
            }
        },

        selectedFamilyIDChanged: function (inOld) {
            if (this.get('.repeaterInitialized')) {

                this.$.repeaterDisplay.staticPostFields = [
                    {fieldName: 'family', value: this.get('.selectedFamilyID')}
                ];

                this.$.repeaterDisplay.endpoint = 'api/v1/assessments/risk-factor-assessments/?family_id=' +
                    this.get('.selectedFamilyID');
            }
        },

        dirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.dirty', inEvent.dirty);
            return true;
        },

        dirtyChanged: function (inOld) {
            this.doRiskFactorAssessmentDirtyStateChanged({'dirty': this.get('.dirty')});
        },

        selectedRiskFactorAssessmentIDChanged: function (inOld) {
            this.$.riskFactorAssessmentQuestions.show();

            this.$.riskFactorAssessmentQuestions.staticPostFields.push(
                {'fieldName': 'family', 'value': this.get('.selectedFamilyID')}
            );
            this.$.riskFactorAssessmentQuestions.endpointBase = 'api/v1/assessments/risk-factor-assessments/';
            this.$.riskFactorAssessmentQuestions.pkFieldName = 'risk_factor_assessment_id';


            /**
             * An array of objects with these fields:
             * - rowNumber
             * - fieldName == the name of the field in the POST sent to the API
             * - nullable == boolean, for validation
             * - questionText
             * - questionPosition == ['inline', 'above'] determines where the question text appears
             * - fieldType == ['checkbox', 'select', 'selectWithOther', 'date']
             * - maxLength == length of text in textbox
             */
            this.$.riskFactorAssessmentQuestions.questions = [
                // Section 1:
                {
                    fieldName: 'family_violence',
                    rowNumber: 100,
                    fieldType: 'none',
                    questionText: '1. Family Violence and Victimization',
                    questionPosition: 'questionOnly',
                    questionClasses: 'oarn-assessment-section-header'
                },
                {
                    rowNumber: 110,
                    fieldName: 'q1a_anger_management',
                    questionText: 'a) An adult in this family has issues with anger management',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 120,
                    fieldName: 'q1b_violent_partner',
                    questionText: 'b) An adult in this family has an emotionally, verbally or physically violent' +
                    ' intimate partner relationship',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 130,
                    fieldName: 'q1c_incarcerated',
                    questionText: 'c) An adult in this family is incarcerated or under supervision with the ' +
                    'criminal justice system',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                // Section 2:
                {
                    fieldName: 'poverty',
                    rowNumber: 200,
                    fieldType: 'none',
                    questionText: '2. Poverty',
                    questionPosition: 'questionOnly',
                    questionClasses: 'oarn-assessment-section-header'
                },
                {
                    rowNumber: 210,
                    fieldName: 'q2a_more_than_three_children',
                    questionText: 'a) This family has more than 3 children in the household',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 220,
                    fieldName: 'q2b_provide_food',
                    questionText: 'b) This family is unable to consistently access and/or provide food to obtain ' +
                    'adequate nutrition for every family member',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 230,
                    fieldName: 'q2c_homeless',
                    questionText: 'c) The caregivers in this family are homeless, or have no permanent home',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 240,
                    fieldName: 'q2d_inadequate_supplies',
                    questionText: 'd) This family has inadequate family supplies/child supplies',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 250,
                    fieldName: 'q2e_no_telephone',
                    questionText: 'e) This family has no telephone or no access to a reliable telephone',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 260,
                    fieldName: 'q2f_below_poverty_level',
                    questionText: 'f) This family\'s income is below the Federal Poverty Level (FPL)' +
                    ' for a family of this size',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 270,
                    fieldName: 'q2g_no_reliable_transportation',
                    questionText: 'g) This family does not have access to reliable transportation',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 280,
                    fieldName: 'q2h_unemployed',
                    questionText: 'h) This family is under/unemployed',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                // Section 3:
                {
                    fieldName: 'child_welfare',
                    rowNumber: 300,
                    fieldType: 'none',
                    questionText: '3. Child Welfare',
                    questionPosition: 'questionOnly',
                    questionClasses: 'oarn-assessment-section-header'
                },
                {
                    rowNumber: 310,
                    fieldName: 'q3a_child_neglected',
                    questionText: 'a) At least one child in this family is being neglected, or is being physically, ' +
                    'emotionally, or sexually abused',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 320,
                    fieldName: 'q3b_out_of_home_placement',
                    questionText: 'b) At least one child in this family is currently in DHS-mandated out of home care',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 330,
                    fieldName: 'q3c_open_child_welfare_case',
                    questionText: 'c) This family has an open child welfare case',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                // Section 4:
                {
                    fieldName: 'mental_health',
                    rowNumber: 400,
                    fieldType: 'none',
                    questionText: '4. Mental Health',
                    questionPosition: 'questionOnly',
                    questionClasses: 'oarn-assessment-section-header'
                },
                {
                    rowNumber: 410,
                    fieldName: 'q4a_high_stress',
                    questionText: 'a) At least one parent in this family is experiencing high stress such as difficulty' +
                    ' coping and/or multiple stressors',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 420,
                    fieldName: 'q4b_child_mental_health',
                    questionText: 'b) At least one child in this family is experiencing mental health problems',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 430,
                    fieldName: 'q4c_parent_mental_health',
                    questionText: 'c) At least one parent in this family is experiencing mental health problems',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 440,
                    fieldName: 'q4d_parent_low_self_esteem',
                    questionText: 'd) At least one parent in this family is experiencing low self-esteem that' +
                    ' interferes with their daily functioning',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                // Section 5:
                {
                    fieldName: 'medical',
                    rowNumber: 500,
                    fieldType: 'none',
                    questionText: '5. Medical',
                    questionPosition: 'questionOnly',
                    questionClasses: 'oarn-assessment-section-header'
                },
                {
                    rowNumber: 510,
                    fieldName: 'q5a_medical_disability',
                    questionText: 'a) At least one parent or child in this family is experiencing a medical disability',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 520,
                    fieldName: 'q5b_child_developmental_disability',
                    questionText: 'b) At least one child in this family has a developmental disability',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 530,
                    fieldName: 'q5c_parent_developmental_disability',
                    questionText: 'c) At least one parent in this family has a developmental disability',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 540,
                    fieldName: 'q5d_mother_pregnant',
                    questionText: 'd) The mother of this family is currently pregnant',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                // Section 6:
                {
                    fieldName: 'other_factors',
                    rowNumber: 600,
                    fieldType: 'none',
                    questionText: '6) Other Risk Factors',
                    questionPosition: 'questionOnly',
                    questionClasses: 'oarn-assessment-section-header'
                },
                {
                    rowNumber: 605,
                    fieldName: 'q6a_language_difficulties',
                    questionText: 'a) In this family there are English language difficulties',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 610,
                    fieldName: 'q6b_divorced_caregivers',
                    questionText: 'b) Caregivers in this family are divorced or separated',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 615,
                    fieldName: 'q6c_lacks_support_system',
                    questionText: 'c) This family lacks a support system other than the Nursery or other professional' +
                    ' personnel',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 620,
                    fieldName: 'q6d_lacks_child_care',
                    questionText: 'd) This family lacks needed child care',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 625,
                    fieldName: 'q6e_minority',
                    questionText: 'e) At least one member of this family is a member of a racial or ethnic minority',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 630,
                    fieldName: 'q6f_new_domestic_partner',
                    questionText: 'f) One or more parents has a new domestic partner',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 635,
                    fieldName: 'q6g_single_parent_family',
                    questionText: 'g) This family is a single parent family',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 640,
                    fieldName: 'q6h_multiple_birth',
                    questionText: 'h) This family has had at least one multiple birth (twins, triplets)',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 645,
                    fieldName: 'q6i_untreated_substance_abuse',
                    questionText: 'i) Untreated substance abuse is present in this family',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 650,
                    fieldName: 'q6j_treated_substance_abuse',
                    questionText: 'j) At least one caregiver in this family is receiving substance abuse treatment',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 655,
                    fieldName: 'q6k_extreme_risk',
                    questionText: 'k) This family is currently at extreme high risk (child in imminent ' +
                    'danger of abuse/neglect)',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 660,
                    fieldName: 'q6l_other',
                    questionText: 'l. Other',
                    questionPosition: 'inlineOneCell',
                    fieldType: 'text',
                    inputStyle: 'width: 125px',
                    maxLength: 50
                },
                {
                    rowNumber: 665,
                    fieldName: 'q6m_other',
                    questionText: 'm. Other',
                    questionPosition: 'inlineOneCell',
                    fieldType: 'text',
                    inputStyle: 'width: 125px',
                    maxLength: 50
                },
                // Section 7:
                {
                    fieldName: 'historical',
                    rowNumber: 700,
                    fieldType: 'none',
                    questionText: '7) Historical Risk Factors',
                    questionPosition: 'questionOnly',
                    questionClasses: 'oarn-assessment-section-header'
                },
                {
                    rowNumber: 705,
                    fieldName: 'q7a_incarceration',
                    questionText: 'a) Incarceration or under criminal justice supervision',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 710,
                    fieldName: 'q7b_partner_violence',
                    questionText: 'b) Emotional, verbal, or physical intimate partner violence',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 715,
                    fieldName: 'q7c_homelessness',
                    questionText: 'c) Homelessness',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 720,
                    fieldName: 'q7d_unemployed',
                    questionText: 'd) Being under/unemployed',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 725,
                    fieldName: 'q7e_limited_education',
                    questionText: 'e) A history of limited education, less than high school diploma or GED',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 730,
                    fieldName: 'q7f_unable_to_provide_food',
                    questionText: 'f) Being unable to provide food to obtain adequate nutrition for every ' +
                    'family member',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 735,
                    fieldName: 'q7g_teen_parent',
                    questionText: 'g) At least one parent that is a teen parent (17 years or younger at 1st birth)',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 740,
                    fieldName: 'q7h_mental_health_problems',
                    questionText: 'h) Mental health problems',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 745,
                    fieldName: 'q7i_drug_affected',
                    questionText: 'i) At least one adult in this family was raised by an alcoholic or drug' +
                    ' affected person',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 750,
                    fieldName: 'q7j_open_child_welfare_case',
                    questionText: 'j) An adult in this family that has had an open child welfare case',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 755,
                    fieldName: 'q7k_termination_of_parental_rights',
                    questionText: 'k) An adult in this family has had at  least one child permanently removed ' +
                    'from their care by a termination of parental rights (TPR)',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 760,
                    fieldName: 'q7l_foster_care',
                    questionText: 'l) A child that\'s been in foster care',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 765,
                    fieldName: 'q7m_physical_abuse',
                    questionText: 'm) At least one adult in this family was a victim of physical abuse or ' +
                    'neglect as a child',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 770,
                    fieldName: 'q7n_sexual_abuse',
                    questionText: 'n) At least one adult in this family was a victim of sexual abuse or' +
                    ' incest as a child',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
            ];

            this.$.riskFactorAssessmentQuestions.createAssessment();
        }
	})

})(enyo, this);