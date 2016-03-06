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
		name: 'oarn.FamilyAssessmentDetails',

        published: {
			token: '',
			dirty: false,
            selectedFamilyID: -1,
            selectedFamilyAssessmentID: -1,
            currentOrgReadOnly: false,

            /**
             * The organization of the logged in user, set to an object in the format:
             * {'organization_id': (number), 'name': 'foo', 'short_name': 'bar'}
             * If a user has rights to multiple organizations, they will be asked to select one
             * for the current session at login. This is bound from the parent.
             *
             * @type {Object}
             * @default null
             * @public
             */
            selectedOrganization: null
        },

		components: [
            {name: 'repeaterDisplay', kind: 'oarn.RepeaterDisplay', style: 'padding: 5px 5px 5px 5px;'},
            {name: 'familyAssessmentQuestions',
				kind: 'oarn.AssessmentGenerator',
				maxWidth: '600px',
				showing: false,
				style: 'padding: 5px 5px 5px 5px;'
			},
            {name: 'selectHelper', kind: 'oarn.SelectHelper'},
			{name: 'popupFactory', kind: 'oarn.PopupFactory'}
        ],

        observers: [
            {method: 'isReady', path: ['selectedFamilyID', 'selectedOrganization']}
        ],

		events: {
			onFamilyAssessmentDirtyStateChanged: ''
		},

        handlers: {
            onRowSelected: 'rowSelectedHandler',
			onPopupClosed: 'popupClosedHandler',
			onRowDeleted: 'rowDeletedHandler',
			onDirtyStateChanged: 'dirtyStateChangedHandler'
        },

        bindings: [
            {from: '.token', to: '.$.repeaterDisplay.token'},
			{from: '.token', to: '.$.familyAssessmentQuestions.token'},
            {from: '.selectedFamilyAssessmentID', to: '.$.familyAssessmentQuestions.assessmentID'},
            {from: '.currentOrgReadOnly', to: '.$.familyAssessmentQuestions.currentOrgReadOnly'}
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
            this.$.repeaterDisplay.set('.groupboxHeaderText', 'Family Assessments');
            this.$.repeaterDisplay.set('.newRecordHeaderText', 'New Family Assessment');
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
                    fieldName: 'family_assessment_id',
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
                    fieldName: 'primary_caregiver',
                    fieldType: 'DataSelect',
                    dataSelectName: 'adults',
                    headerText: 'Primary Caregiver',
                    labelText: 'Primary Caregiver',
                    fieldWidth: 175
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

            this.$.repeaterDisplay.endpoint = 'api/v1/assessments/family-assessments/?family_id=' +
                this.get('.selectedFamilyID');
            this.$.repeaterDisplay.patchEndpoint = 'api/v1/assessments/family-assessments/';
            this.$.repeaterDisplay.postEndpoint = 'api/v1/assessments/family-assessments/';
            this.$.repeaterDisplay.deleteEndpoint = 'api/v1/assessments/family-assessments/';

            this.$.repeaterDisplay.allowsNewRecords = !(this.get('.currentOrgReadOnly'));

            this.$.repeaterDisplay.set('maxWidth', 700);

            this.$.repeaterDisplay.createRepeater();

            this.set('.repeaterInitialized', true);

        },

        rowSelectedHandler: function (inSender, inEvent) {
			var collection = this.$.repeaterDisplay.getCollection();
			var list = this.$.repeaterDisplay.getOptionsList('intervals_options_list');

			if (collection.at(inEvent.index).get('family_assessment_id') != this.get('.selectedFamilyAssessmentID') &&
				this.$.familyAssessmentQuestions.dirty) {

				var msg = 'You appear to have unsaved changes to the selected assessment. ' +
					'Clicking \'Yes\' will change the selected assessment and your unsaved changes will be' +
					' lost. Continue anyway?';

				this.set('.targetID', collection.at(inEvent.index).get('family_assessment_id'));
				this.set('.targetIndex', inEvent.index);
				this.set('confirmPopupMode', 'confirmMove');
				this.$.popupFactory.showConfirm('Unsaved Changes', msg);
			}
			else if (collection.at(inEvent.index).get('family_assessment_id') != this.get('.selectedFamilyAssessmentID') &&
				!this.$.familyAssessmentQuestions.dirty) {

				var htext = 'none';
				for (var i = 0; i < list.length; i++) {
					if (list[i].value == collection.at(inEvent.index).get('ref_assessment_interval')) {
						htext = 'Family Assessment ' + collection.at(inEvent.index).get('family_assessment_id') + ': ' +
							list[i].display_text;
						break;
					}
				}
				this.set('.selectedFamilyAssessmentID',
					this.$.repeaterDisplay.collection.at(inEvent.index).get('family_assessment_id')
				);

				this.set('.$.familyAssessmentQuestions.groupboxHeaderText', htext);
				this.set('.currentIndex', inEvent.index);
			}
        },

		rowDeletedHandler: function (inSender, inEvent) {
			if (this.get('.currentIndex') == inEvent.index) {
				this.$.familyAssessmentQuestions.hide();
			}
			return true;
		},

		popupClosedHandler: function (inSender, inEvent) {
			if (this.get('.confirmPopupMode') == 'confirmMove') {
				if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
					return true; // we only want to take action if a confirmation has occurred
				}
				else if (inEvent.confirmed) {
					this.$.familyAssessmentQuestions.setDirty(false);
					var collection = this.$.repeaterDisplay.getCollection();
					var list = this.$.repeaterDisplay.getOptionsList('intervals_options_list');

					var htext = 'none';
					for (var i = 0; i < list.length; i++) {
						if (list[i].value == collection.at(this.get('.targetIndex')).get('ref_assessment_interval')) {
							htext = 'Family Assessment ' + collection.at(this.get('.targetIndex')).get('family_assessment_id') + ': ' +
								list[i].display_text;
							break;
						}
					}
					this.set('.selectedFamilyAssessmentID', this.get('.targetID'));

					this.set('.$.familyAssessmentQuestions.groupboxHeaderText', htext);

				}
				this.set('.confirmPopupMode', '');
				return true;
			}
		},

		dirtyStateChangedHandler: function (inSender, inEvent) {
			this.set('.dirty', inEvent.dirty);
			return true;
		},

		dirtyChanged: function (inOld) {
			this.doFamilyAssessmentDirtyStateChanged({'dirty': this.get('.dirty')});
		},

        selectedFamilyAssessmentIDChanged: function (inOld) {
            this.$.familyAssessmentQuestions.show();

			this.$.familyAssessmentQuestions.staticPostFields.push({'fieldName': 'family', 'value': this.get('.selectedFamilyID')});
            this.$.familyAssessmentQuestions.endpointBase = 'api/v1/assessments/family-assessments/';
            this.$.familyAssessmentQuestions.pkFieldName = 'family_assessment_id';


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
            this.$.familyAssessmentQuestions.questions = [
				{
					rowNumber: 1,
					fieldName: 'q5_pc_lives_with_relatives',
					required: false,
					questionText: '5. Family lives with parents/relatives',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 2,
					fieldName: 'q6_pc_attends_school',
					required: false,
					questionText: '6. PC attends school',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 3,
					fieldName: 'q7_pc_marital_status',
					required: true,
					questionText: '7. PC marital status',
					requiredText: 'Question 7',
					questionPosition: 'inline',
					fieldType: 'select',
					dataSelectName: 'marital'
				},
				{
					rowNumber: 4,
					fieldName: 'q8_pc_employment',
					required: true,
					requiredText: 'Question 8',
					questionText: '8. PC employment (if on parental leave, status to which PC will return)',
					questionPosition: 'above',
					fieldType: 'select',
					dataSelectName: 'employment'
				},
				{
					rowNumber: 5,
					fieldName: 'q9_pc_has_primary_health_provider',
					required: false,
					questionText: '9. Is the primary caregiver linked to a primary health care provider?',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 6,
					fieldName: 'q10_gross_monthly_income',
					required: true,
					questionText: '10. Gross monthly family income',
					requiredText: 'Question 10',
					questionPosition: 'inline',
					fieldType: 'select',
					dataSelectName: 'income'
				},
				{
					rowNumber: 7,
					fieldName: 'q11_size_of_family',
					required: true,
					questionText: '11. Size of family supported by income',
					requiredText: 'Question 11',
					questionPosition: 'inline',
					fieldType: 'select',
					dataSelectName: 'familysize'
				},
				{
					rowNumber: 8,
					fieldName: 'q12_pc_education_no_high_school',
					required: false,
					questionText: '12. PC has less than a high school education (including no GED)',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 9,
					fieldName: 'q13_family_member_has_health_insurance',
					required: false,
					questionText: '13. Does anyone in the family have health insurance?',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 10,
					fieldName: 'q14_emergency_services',
					required: true,
					questionText: '14. How frequently has the family used emergency services for routine health care in the past 6 months?',
					questionPosition: 'above',
					requiredText: 'Question 14',
					fieldType: 'select',
					dataSelectName: 'emergency'
				},
				// Family Functioning and Literacy
				{
					fieldName: 'functioning',
					rowNumber: 11,
					fieldType: 'none',
					questionText: 'Family Functioning and Literacy:',
					questionPosition: 'questionOnly'
				},
				{
					rowNumber: 12,
					fieldName: 'q18_routine_responsibilities',
					required: true,
					questionText: '18. Handle routine child-related household and family responsibilities appropriately',
					questionPosition: 'inline',
					requiredText: 'Question 18',
					fieldType: 'select',
					dataSelectName: 'frequency'
				},
				{
					rowNumber: 13,
					fieldName: 'q19_positive_social_support',
					required: true,
					questionText: '19. Make use of a positive social support system or person(s) other than the home-visitor',
					questionPosition: 'inline',
					requiredText: 'Question 19',
					fieldType: 'select',
					dataSelectName: 'frequency'
				},
				{
					rowNumber: 14,
					fieldName: 'q20_daily_routine',
					required: true,
					questionText: '20. Maintain consistent daily routines for child(ren) such as bedtimes, meals, naps, baths',
					questionPosition: 'inline',
					requiredText: 'Question 20',
					fieldType: 'select',
					dataSelectName: 'frequency'
				},
				{
					rowNumber: 15,
					fieldName: 'q21_reading_frequency',
					required: true,
					questionText: '21. How often does the parent read to the child at least 15 minutes?',
					questionPosition: 'inline',
					requiredText: 'Question 21',
					fieldType: 'select',
					dataSelectName: 'readfrequency'
				},
				// services used
				{
					fieldName: 'services',
					rowNumber: 16,
					fieldType: 'none',
					questionText: '22. Which services or resources does the family currently use?',
					questionPosition: 'questionOnly'
				},
				{
					rowNumber: 17,
					fieldName: 'q22a_wic',
					questionText: 'a. WIC',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 17,
					fieldName: 'q22l_material_assistance',
					questionText: 'l. Baby supplies or other material goods assistance',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 18,
					fieldName: 'q22b_food_stamps',
					questionText: 'b. Food stamps',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 18,
					fieldName: 'q22m_legal_aid',
					questionText: 'm. Legal aid',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 19,
					fieldName: 'q22c_food_bank',
					questionText: 'c. Food boxes/Food Bank',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 19,
					fieldName: 'q22n_transportation_assistance',
					questionText: 'n. Transportation assistance',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 20,
					fieldName: 'q22d_tanf',
					questionText: 'TANF cash assistance',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 20,
					fieldName: 'q22o_child_care',
					questionText: 'o. Child care',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 21,
					fieldName: 'q22e_other_cash_assistance',
					questionText: 'e. Other cash assistance',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 21,
					fieldName: 'q22p_child_care_payment_assistance',
					questionText: 'p. Child care payment assistance',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 22,
					fieldName: 'q22f_housing_assistance',
					questionText: 'f. Housing assistance',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 22,
					fieldName: 'q22q_education_assistance',
					questionText: 'q. Education assistance (basic education/literacy)',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 23,
					fieldName: 'q22g_utility_assistance',
					questionText: 'g. Utility assistance',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 23,
					fieldName: 'q22r_esl_classes',
					questionText: 'r. ESL classes',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 24,
					fieldName: 'q22h_medicaid_ohp',
					questionText: 'h. Medicaid/OHP',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 24,
					fieldName: 'q22s_job_training',
					questionText: 's. Job training',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 25,
					fieldName: 'q22i_other_medical_insurance',
					questionText: 'i. Other medical insurance',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 25,
					fieldName: 'q22t_a_d_counseling',
					questionText: 't. A & D counseling',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 26,
					fieldName: 'q22j_dental_insurance',
					questionText: 'j. Dental insurance',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 26,
					fieldName: 'q22u_mental_health_counseling',
					questionText: 'u. Mental health counseling',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 27,
					fieldName: 'q22k_family_planning',
					questionText: 'k. Family planning',
					questionPosition: 'inline',
					fieldType: 'checkbox'
				},
				{
					rowNumber: 27,
					fieldName: 'q22v_other',
					questionText: 'v. Other',
					questionPosition: 'inlineOneCell',
					fieldType: 'text',
                    inputStyle: 'width: 125px',
					maxLength: 50
				},
				// 23. Rate strengths for the parent(s) at this time
				{
					fieldName: 'strengths',
					rowNumber: 28,
					fieldType: 'none',
					questionText: '23. Rate strengths for the parent(s) at this time',
					questionPosition: 'questionOnly'
				},
				{
					rowNumber: 29,
					fieldName: 'q23a_pc_optimistic_outlook',
					required: false,
					questionText: 'a. Optimisitic outlook on life',
					questionPosition: 'inline',
					requiredText: 'Question 23.a',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				{
					rowNumber: 30,
					fieldName: 'q23b_pc_humor',
					required: false,
					questionText: 'b. Sense of humor',
					questionPosition: 'inline',
					requiredText: 'Question 23.b',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				{
					rowNumber: 31,
					fieldName: 'q23c_pc_copes_effectively',
					required: false,
					questionText: 'c. Copes effectively w/stress',
					questionPosition: 'inline',
					requiredText: 'Question 23.c',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				{
					rowNumber: 32,
					fieldName: 'q23d_pc_manages_anger',
					required: false,
					questionText: 'd. Manages anger constructively',
					questionPosition: 'inline',
					requiredText: 'Question 23.d',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				{
					rowNumber: 33,
					fieldName: 'q23e_sc_problem_solving',
					required: false,
					questionText: 'e. Good problem-solving skills',
					questionPosition: 'inline',
					requiredText: 'Question 23.e',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				{
					rowNumber: 34,
					fieldName: 'q23f_pc_supportive_partner',
					required: false,
					questionText: 'f. Supportive partner or spouse',
					questionPosition: 'inline',
					requiredText: 'Question 23.f',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				{
					rowNumber: 35,
					fieldName: 'q23g_pc_supportive_friends',
					required: false,
					questionText: 'g. Supportive adult friend(s) or family members',
					questionPosition: 'inline',
					requiredText: 'Question 23.g',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				{
					rowNumber: 36,
					fieldName: 'q23h_pc_realistic_goals',
					required: false,
					questionText: 'h. Realistic personal goals (education, self-improvement)',
					questionPosition: 'inline',
					requiredText: 'Question 23.h',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				{
					rowNumber: 37,
					fieldName: 'q23i_pc_interested',
					required: false,
					questionText: 'i. Interested in learning about child development',
					questionPosition: 'inline',
					requiredText: 'Question 23.i',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				{
					rowNumber: 38,
					fieldName: 'q23j_pc_understands_child_needs',
					required: false,
					questionText: "j. Understands and respects the child's needs",
					questionPosition: 'inline',
					requiredText: 'Question 23.j',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				{
					rowNumber: 39,
					fieldName: 'q23k_pc_emotional_involvement',
					required: false,
					questionText: "k. Positive emotional involvement with the child",
					questionPosition: 'inline',
					requiredText: 'Question 23.k',
					fieldType: 'select',
					dataSelectName: 'strengths'
				},
				// Engagement, Home Safety, and Health
				{
					fieldName: 'engagement',
					rowNumber: 40,
					fieldType: 'none',
					questionText: 'Engagement, Home Safety, and Health',
					questionPosition: 'questionOnly'
				},
				{
					rowNumber: 41,
					fieldName: 'q24_engage_actively',
					required: false,
					questionText: "24. Engage actively in home visit discussions and activities",
					questionPosition: 'inline',
					requiredText: 'Question 24',
					fieldType: 'select',
					dataSelectName: 'frequency'
				},
				{
					rowNumber: 42,
					fieldName: 'q25_interested_in_advice',
					required: false,
					questionText: "25. Seem interested in advice or suggestions that you provide",
					questionPosition: 'inline',
					requiredText: 'Question 25',
					fieldType: 'select',
					dataSelectName: 'frequency'
				},
				{
					rowNumber: 43,
					fieldName: 'q26_keep_appointments',
					required: false,
					questionText: "26. Keep appointments",
					questionPosition: 'inline',
					requiredText: 'Question 26',
					fieldType: 'select',
					dataSelectName: 'frequencytwo'
				},
				{
					rowNumber: 44,
					fieldName: 'q27_reschedule_appointments',
					required: false,
					questionText: "27. Call to reschedule appointments",
					questionPosition: 'inline',
					requiredText: 'Question 27',
					fieldType: 'select',
					dataSelectName: 'frequencytwo'
				},
				{
					rowNumber: 45,
					fieldName: 'q28_outside_clean',
					required: false,
					questionText: "28. Keep the outside of the home clean and orderly",
					questionPosition: 'inline',
					requiredText: 'Question 28',
					fieldType: 'select',
					dataSelectName: 'frequency'
				},
				{
					rowNumber: 46,
					fieldName: 'q29_inside_clean',
					required: false,
					questionText: "29. Keep the inside of the home clean and orderly",
					questionPosition: 'inline',
					requiredText: 'Question 29',
					fieldType: 'select',
					dataSelectName: 'frequency'
				},
				{
					rowNumber: 47,
					fieldName: 'q30_outside_safe',
					required: false,
					questionText: "30. Keep the outside of the home safe",
					questionPosition: 'inline',
					requiredText: 'Question 30',
					fieldType: 'select',
					dataSelectName: 'frequency'
				},
				{
					rowNumber: 48,
					fieldName: 'q31_inside_safe',
					required: false,
					questionText: "31. Keep the inside of the home safe",
					questionPosition: 'inline',
					requiredText: 'Question 31',
					fieldType: 'select',
					dataSelectName: 'frequency'
				},
				{
					rowNumber: 49,
					fieldName: 'q32_passive_smoke',
					required: false,
					questionText: "32. Do the children receive passive smoke exposure?",
					questionPosition: 'inline',
					requiredText: 'Question 32',
					fieldType: 'select',
					dataSelectName: 'smoke'
				},
				{
					rowNumber: 50,
					fieldName: 'q33_overall_family_health',
					required: false,
					questionText: "33. How would you rate the family's health, overall?",
					questionPosition: 'inline',
					requiredText: 'Question 33',
					fieldType: 'select',
					dataSelectName: 'quality'
				},
				{
					rowNumber: 51,
					fieldName: 'q34_overall_family_nutrition',
					required: false,
					questionText: "34. How would you rate the family's nutrition, overall?",
					questionPosition: 'inline',
					requiredText: 'Question 34',
					fieldType: 'select',
					dataSelectName: 'quality'
				},

            ];

            this.$.familyAssessmentQuestions.selectEndpoints = [
                {
                    endpoint: 'api/v1/ref/languages/',
                    name: 'languages',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/marital-statuses/',
                    name: 'marital',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/employment-statuses/',
                    name: 'employment',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/gross-monthly-income/',
                    name: 'income',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/size-of-family/',
                    name: 'familysize',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/emergency-services/',
                    name: 'emergency',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/frequency-scale/',
                    name: 'frequency',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/reading-frequency/',
                    name: 'readfrequency',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/strengths-scale/',
                    name: 'strengths',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/frequency-scale-two/',
                    name: 'frequencytwo',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/smoke-exposure-scale/',
                    name: 'smoke',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable

                },
                {
                    endpoint: 'api/v1/ref/quality-scale/',
                    name: 'quality',
					nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                }
            ];

            this.$.familyAssessmentQuestions.createAssessment();
        }

	})

})(enyo, this);