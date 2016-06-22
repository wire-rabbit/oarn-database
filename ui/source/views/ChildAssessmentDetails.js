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
		name: 'oarn.ChildAssessmentDetails',

		published: {
			token: '',
			dirty: false,
			selectedFamilyID: -1,
			selectedChildID: -1,
			selectedChildAssessmentID: -1,
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
			{name: 'childAssessmentQuestions',
				kind: 'oarn.AssessmentGenerator',
				maxWidth: '675px',
				showing: false,
				style: 'padding: 5px 5px 5px 5px;'
			},
			{name: 'selectHelper', kind: 'oarn.SelectHelper'},
			{name: 'popupFactory', kind: 'oarn.PopupFactory'}
		],

		events: {
			onChildAssessmentDirtyStateChanged: ''
		},

		handlers: {
			onRowSelected: 'rowSelectedHandler',
			onPopupClosed: 'popupClosedHandler',
			onRowDeleted: 'rowDeletedHandler',
			onDirtyStateChanged: 'dirtyStateChangedHandler',
                        onChangeAlert: 'changeAlertHandler'
		},

		bindings: [
			{from: '.token', to: '.$.repeaterDisplay.token'},
			{from: '.token', to: '.$.childAssessmentQuestions.token'},
			{from: '.selectedChildAssessmentID', to: '.$.childAssessmentQuestions.assessmentID'},
			{from: '.currentOrgReadOnly', to: '.$.childAssessmentQuestions.currentOrgReadOnly'}
		],

        observers: [
            {method: 'isReady', path: ['selectedOrganization', 'selectedChildID']}
        ],

        /**
         * Wait for selectedChildID and selectedOrganization to be set before building controls.
         *
         * @private
         */
        isReady: function (previous, current, property) {
            if (this.get('.selectedChildID') != -1 && (this.get('.selectedOrganization') != null)) {
                this.defineRepeaterDisplay();
            }
        },

		create: function () {
			this.inherited(arguments);
		},

		defineRepeaterDisplay: function () {
			this.$.repeaterDisplay.set('.groupboxHeaderText', 'Child Assessments');
			this.$.repeaterDisplay.set('.newRecordHeaderText', 'New Child Assessment');
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
				}
			];

			this.$.repeaterDisplay.staticPostFields = [
				{fieldName: 'family', value: this.get('.selectedFamilyID')},
                {fieldName: 'child', value: this.get('.selectedChildID')}
			];

			this.$.repeaterDisplay.fields = [
				{
					fieldName: 'family',
					postBodyOnly: true
				},
				{
					fieldName: 'child',
					postBodyOnly: true
				},
				{
					fieldName: 'child_assessment_id',
					postBodyOnly: true,
					primaryKey: true
				},
				{
					fieldName: 'ref_assessment_interval',
					fieldType: 'DataSelect',
					dataSelectName: 'intervals',
					headerText: 'Assessment Interval',
					labelText: 'Assessment Interval',
					fieldWidth: 100,
                                        alertOnChange: true
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

			this.$.repeaterDisplay.endpoint = 'api/v1/assessments/child-assessments/?child_id=' +
				this.get('.selectedChildID');
			this.$.repeaterDisplay.patchEndpoint = 'api/v1/assessments/child-assessments/';
			this.$.repeaterDisplay.postEndpoint = 'api/v1/assessments/child-assessments/';
			this.$.repeaterDisplay.deleteEndpoint = 'api/v1/assessments/child-assessments/';

			this.$.repeaterDisplay.allowsNewRecords = !(this.get('.currentOrgReadOnly'));

			this.$.repeaterDisplay.set('maxWidth', 550);

			this.$.repeaterDisplay.createRepeater();

			this.set('.repeaterInitialized', true);

		},

        rowSelectedHandler: function (inSender, inEvent) {
            var collection = this.$.repeaterDisplay.getCollection();
            var list = this.$.repeaterDisplay.getOptionsList('intervals_options_list');

            if (collection.at(inEvent.index).get('child_assessment_id') != this.get('.selectedChildAssessmentID') &&
                this.$.childAssessmentQuestions.dirty) {

                var msg = 'You appear to have unsaved changes to the selected assessment. ' +
                    'Clicking \'Yes\' will change the selected assessment and your unsaved changes will be' +
                    ' lost. Continue anyway?';

                this.set('.targetID', collection.at(inEvent.index).get('child_assessment_id'));
                this.set('.targetIndex', inEvent.index);
                this.set('confirmPopupMode', 'confirmMove');
                this.$.popupFactory.showConfirm('Unsaved Changes', msg);
            }
            else if (collection.at(inEvent.index).get('child_assessment_id') != this.get('.selectedChildAssessmentID') &&
                !this.$.childAssessmentQuestions.dirty) {

                var htext = 'none';
                for (var i = 0; i < list.length; i++) {
                    if (list[i].value == collection.at(inEvent.index).get('ref_assessment_interval')) {
                        htext = 'Child Assessment ' + collection.at(inEvent.index).get('child_assessment_id') + ': ' +
                            list[i].display_text;
                        if (list[i].display_text == 'Intake') { // we don't yet do anything with this
                            this.set('.isIntake', true);
                        }
                        else {
                            this.set('.isIntake', false);
                        }
                        break;
                    }
                }
                this.set('.selectedChildAssessmentID',
                    this.$.repeaterDisplay.collection.at(inEvent.index).get('child_assessment_id')
                );

                this.set('.$.childAssessmentQuestions.groupboxHeaderText', htext);
                this.set('.currentIndex', inEvent.index);
            }
        },

        rowDeletedHandler: function (inSender, inEvent) {
            if (this.get('.currentIndex') == inEvent.index) {
                this.$.childAssessmentQuestions.hide();
            }
            return true;
        },

        popupClosedHandler: function (inSender, inEvent) {
            if (this.get('.confirmPopupMode') == 'confirmMove') {
                if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
                    return true; // we only want to take action if a confirmation has occurred
                }
                else if (inEvent.confirmed) {
                    this.$.childAssessmentQuestions.setDirty(false);
                    var collection = this.$.repeaterDisplay.getCollection();
                    var list = this.$.repeaterDisplay.getOptionsList('intervals_options_list');

                    var htext = 'none';
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].value == collection.at(this.get('.targetIndex')).get('ref_assessment_interval')) {
                            htext = 'Child Assessment ' + collection.at(this.get('.targetIndex')).get('child_assessment_id') + ': ' +
                                list[i].display_text;
                            break;
                        }
                    }
                    this.set('.selectedChildAssessmentID', this.get('.targetID'));

                    this.set('.$.childAssessmentQuestions.groupboxHeaderText', htext);

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
            this.doChildAssessmentDirtyStateChanged({'dirty': this.get('.dirty')});
        },

        selectedChildAssessmentIDChanged: function (inOld) {
            this.$.childAssessmentQuestions.show();

            this.$.childAssessmentQuestions.staticPostFields.push(
                {'fieldName': 'family', 'value': this.get('.selectedFamilyID')},
                {'fieldName': 'child', 'value': this.get('.selectedChildID')}
            );
            this.$.childAssessmentQuestions.endpointBase = 'api/v1/assessments/child-assessments/';
            this.$.childAssessmentQuestions.pkFieldName = 'child_assessment_id';


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
            this.$.childAssessmentQuestions.questions = [
                {
                    rowNumber: 0,
                    fieldName: 'childWelfareHistorySection',
                    required: false,
                    questionText: 'Child Welfare History (Intake Only)',
                    questionPosition: 'questionOnly',
                    fieldType: 'none'
                },
                {
                    rowNumber: 1,
                    fieldName: 'q1_intake_foster_care',
                    required: false,
                    questionText: '1. Was this child in out of home foster care at or within 30 days of program intake?',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    fieldName: 'q2_intake_dhs_report',
                    rowNumber: 2,
                    questionText: '2. At or within the first 30 days of program intake did a Relief Nursery staff ' +
                    'member make a report to DHS (child protective services) on this child?',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 3,
                    fieldName: 'q2_intake_dhs_report_date',
                    required: false,
                    questionText: 'Date of report:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 4,
                    fieldName: 'q3question',
                    questionText: '3. Please list the start and end dates for each foster care placement for this' +
                    ' child prior to and at intake:',
                    questionPosition: 'questionOnly',
                    fieldType: 'none'
                },
                {
                    rowNumber: 5,
                    fieldName: 'q3_dhs_ep1_start_date',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    required: false,
                    questionText: 'Episode 1: Start date:',
                    questionPosition: 'inline',
                    invalidText: 'Question 3, episode 1 start date',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 5,
                    fieldName: 'q3_dhs_ep1_end_date',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    required: false,
                    questionText: 'End date:',
                    invalidText: 'Question 3, episode 1 end date',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 6,
                    fieldName: 'q3_dhs_ep2_start_date',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    required: false,
                    questionText: 'Episode 2: Start date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 6,
                    fieldName: 'q3_dhs_ep2_end_date',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    required: false,
                    questionText: 'End date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 7,
                    fieldName: 'q3_dhs_ep3_start_date',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    required: false,
                    questionText: 'Episode 3: Start date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 7,
                    fieldName: 'q3_dhs_ep3_end_date',
                    questionStyle: 'font-size:smaller;',
                    required: false,
                    questionText: 'End date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 8,
                    fieldName: 'q3_dhs_ep4_start_date',
                    required: false,
                    questionText: 'Episode 4: Start date:',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 8,
                    fieldName: 'q3_dhs_ep4_end_date',
                    required: false,
                    questionStyle: 'font-size:smaller;width: 50%;',
                    questionText: 'End date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 9,
                    fieldName: 'childWelfareCurrentSection',
                    required: false,
                    questionText: 'Child Welfare Status',
                    questionPosition: 'questionOnly',
                    fieldType: 'none'
                },
                {
                    rowNumber: 10,
                    fieldName: 'q4_intake_dhs_report',
                    required: false,
                    questionText: '4. Since program intake, or during the past 6 months, has a Relief Nursery ' +
                    'staff member made a report to DHS (child protective services)?',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 11,
                    fieldName: 'q4_intake_dhs_report_date',
                    required: false,
                    questionText: 'Date of report:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 12,
                    fieldName: 'q5_child_removed',
                    required: false,
                    questionText: '5. Has this child been removed from their parent\'s care since ' +
                    'program intake, or during the past 6 months?',
                    questionPosition: 'inline',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 13,
                    fieldName: 'q6question',
                    questionText: '6. Please list the start and end dates for each foster care placement ' +
                    'for this child since program intake:',
                    questionPosition: 'questionOnly',
                    fieldType: 'none'
                },
                {
                    rowNumber: 14,
                    fieldName: 'q6_dhs_ep1_start_date',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    required: false,
                    questionText: 'Episode 1: Start date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 14,
                    fieldName: 'q6_dhs_ep1_end_date',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    required: false,
                    questionText: 'End date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 15,
                    fieldName: 'q6_dhs_ep2_start_date',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    required: false,
                    questionText: 'Episode 2: Start date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 15,
                    fieldName: 'q6_dhs_ep2_end_date',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    required: false,
                    questionText: 'End date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 16,
                    fieldName: 'q6_dhs_ep3_start_date',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    required: false,
                    questionText: 'Episode 3: Start date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 16,
                    fieldName: 'q6_dhs_ep3_end_date',
                    questionStyle: 'font-size:smaller;',
                    required: false,
                    questionText: 'End date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 17,
                    fieldName: 'q6_dhs_ep4_start_date',
                    required: false,
                    questionText: 'Episode 4: Start date:',
                    questionStyle: 'font-size:smaller;width: 50%;',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 17,
                    fieldName: 'q6_dhs_ep4_end_date',
                    required: false,
                    questionStyle: 'font-size:smaller;width: 50%;',
                    questionText: 'End date:',
                    questionPosition: 'inline',
                    fieldType: 'date',
                    emptyIsValid: true
                },
                {
                    rowNumber: 18,
                    fieldName: 'parentChildSection',
                    questionText: 'Parent-Child Interaction',
                    questionPosition: 'questionOnly',
                    fieldType: 'none'
                },
                {
                    rowNumber: 19,
                    required: true,
                    fieldName: 'q7_enjoys_child',
                    questionText: '7. Enjoys the child and expresses warmth and love',
                    requiredText: 'Question 7',
                    fieldType: 'select',
                    dataSelectName: 'frequency'
                },
                {
                    rowNumber: 20,
                    required: true,
                    fieldName: 'q8_shows_sensitivity',
                    questionText: '8. Shows sensitivity to child\'s feelings, needs and/or interests',
                    requiredText: 'Question 8',
                    fieldType: 'select',
                    dataSelectName: 'frequency'
                },
                {
                    rowNumber: 21,
                    required: true,
                    fieldName: 'q9_loving_guidance',
                    questionText: '9. Uses effective, firm, but loving guidance',
                    requiredText: 'Question 9',
                    fieldType: 'select',
                    dataSelectName: 'frequency'
                },
                {
                    rowNumber: 22,
                    required: true,
                    fieldName: 'q10_responds_appropriately',
                    questionText: '10. Responds appropriately to the child\'s behaviors/needs',
                    requiredText: 'Question 10',
                    fieldType: 'select',
                    dataSelectName: 'frequency'
                },
                {
                    rowNumber: 23,
                    required: true,
                    fieldName: 'q11_adjusts_environment',
                    questionText: '11. Adjusts environment and responses to child\'s temperament and needs',
                    requiredText: 'Question 11',
                    fieldType: 'select',
                    dataSelectName: 'frequency'
                },
                {
                    rowNumber: 24,
                    required: true,
                    fieldName: 'q12_reciprocal_interactions',
                    questionText: '12. Engages in reciprocal interactions, conversations, or play involving turn-taking',
                    requiredText: 'Question 12',
                    fieldType: 'select',
                    dataSelectName: 'frequency'
                },
                {
                    rowNumber: 25,
                    required: true,
                    fieldName: 'q13_provides_encouragement',
                    questionText: '13. Provides encouragement (both verbal and nonverbal support) ' +
                    'for developmental advances',
                    requiredText: 'Question 13',
                    fieldType: 'select',
                    dataSelectName: 'frequency'
                },
                {
                    rowNumber: 26,
                    required: true,
                    fieldName: 'q14_learning_environment',
                    questionText: '14. Creates a developmentally appropriate learning environment for child',
                    requiredText: 'Question 14',
                    fieldType: 'select',
                    dataSelectName: 'frequency'
                },
                {
                    rowNumber: 27,
                    fieldName: 'childHealthSection',
                    questionText: 'Child\'s Health',
                    questionPosition: 'questionOnly',
                    fieldType: 'none'
                },
                {
                    rowNumber: 28,
                    required: false,
                    fieldName: 'q15_diagnosed_disability',
                    questionText: '15. Does the child have a diagnosed disability?',
                    requiredText: 'Question 15',
                    fieldType: 'select',
                    dataSelectName: 'yesnodk'
                },
                {
                    rowNumber: 28.5,
                    required: false,
                    fieldName: 'q15a_referred_to_ei',
                    questionText: '15a. If “Yes,” does the child receive early intervention services?',
                    requiredText: 'Question 15a',
                    fieldType: 'select',
                    dataSelectName: 'yesnodk'
                },
                {
                    rowNumber: 29,
                    required: false,
                    fieldName: 'q16_asq_screening_age',
                    questionText: '16. Indicate the most recent ASQ development screening',
                    requiredText: 'Question 16',
                    fieldType: 'select',
                    dataSelectName: 'asqscreeningage'
                },
                {
                    rowNumber: 30,
                    required: false,
                    fieldName: 'q17_developmental_status',
                    questionText: '17. Indicate the child\'s developmental status on this screening',
                    requiredText: 'Question 17',
                    fieldType: 'select',
                    dataSelectName: 'asqsedevstatus'
                },
                {
                    rowNumber: 30.5,
                    required: false,
                    fieldName: 'q17_developmental_status_other',
                    questionText: 'Other: ',
                    fieldType: 'text',
                    inputStyle: 'width: 125px',
                    maxLength: 50
                },
                {
                    rowNumber: 31,
                    required: false,
                    fieldName: 'q18_asqse_screening_age',
                    questionText: '18. Indicate the most recent ASQ Social/Emotional development screening',
                    requiredText: 'Question 18',
                    fieldType: 'select',
                    dataSelectName: 'asqsescreeningage'
                },
                {
                    rowNumber: 32,
                    required: false,
                    fieldName: 'q19_asqse_dev_status',
                    questionText: '19. Indicate the child\'s developmental status on the ASQ Social/Emotional screening',
                    requiredText: 'Question 19',
                    fieldType: 'select',
                    dataSelectName: 'asqsedevstatus'
                },
                {
                    rowNumber: 32.5,
                    required: false,
                    fieldName: 'q19_asqse_dev_status_other',
                    questionText: 'Other: ',
                    fieldType: 'text',
                    inputStyle: 'width: 125px',
                    maxLength: 50
                },
                {
                    rowNumber: 33,
                    required: false,
                    fieldName: 'q20_further_evaluation',
                    questionText: '20. Was or will the child be referred for further evaluation?',
                    requiredText: 'Question 20',
                    fieldType: 'checkbox'
                },
                {
                    rowNumber: 34,
                    required: false,
                    fieldName: 'q21_immunizations',
                    questionText: '21. Are the child\'s immunizations up to date?',
                    requiredText: 'Question 21',
                    fieldType: 'select',
                    dataSelectName: 'immunizationstatus'
                },
                {
                    rowNumber: 35,
                    required: false,
                    fieldName: 'q22_height',
                    questionText: '22. The child\'s height is',
                    requiredText: 'Question 22',
                    fieldType: 'select',
                    dataSelectName: 'childheight'
                },
                {
                    rowNumber: 36,
                    required: false,
                    fieldName: 'q23_weight',
                    questionText: '23. The child\'s weight is',
                    requiredText: 'Question 23',
                    fieldType: 'select',
                    dataSelectName: 'childweight'
                },
                {
                    rowNumber: 37,
                    required: false,
                    fieldName: 'q24_overall_health',
                    questionText: '24. How would you rate the child\'s health overall?',
                    requiredText: 'Question 24',
                    fieldType: 'select',
                    dataSelectName: 'qualityscale'
                },
                {
                    rowNumber: 38,
                    required: false,
                    fieldName: 'q25_special_health_needs',
                    questionText: '25. Does the child have any special health needs?',
                    requiredText: 'Question 25',
                    fieldType: 'select',
                    dataSelectName: 'yesnodk'
                },
                {
                    rowNumber: 39,
                    required: false,
                    fieldName: 'q25_special_health_description',
                    questionText: 'If yes, specify special health needs:',
                    fieldType: 'text',
                    inputStyle: 'width: 125px',
                    maxLength: 50
                },
                {
                    rowNumber: 40,
                    required: false,
                    fieldName: 'q26_health_provider',
                    questionText: '26. Is the child linked to a primary health care provider?',
                    requiredText: 'Question 26',
                    fieldType: 'select',
                    dataSelectName: 'yesnodk'
                },
                {
                    rowNumber: 41,
                    fieldName: 'finalSection',
                    questionText: 'Items 27-31 are completed once at Program Intake',
                    questionPosition: 'questionOnly',
                    fieldType: 'none'
                },
                {
                    rowNumber: 42,
                    required: false,
                    fieldName: 'q27_mother_smoked',
                    questionText: '27. Did mother smoke during pregnancy?',
                    requiredText: 'Question 27',
                    fieldType: 'select',
                    dataSelectName: 'yesnodk'
                },
                {
                    rowNumber: 43,
                    required: false,
                    fieldName: 'q28_premature',
                    questionText: '28. Was the child born premature?',
                    requiredText: 'Question 28',
                    fieldType: 'select',
                    dataSelectName: 'yesnodk'
                },
                {
                    rowNumber: 44,
                    required: false,
                    fieldName: 'q29_underweight',
                    questionText: '29. Did the child weigh less than 5.5 lbs?',
                    requiredText: 'Question 29',
                    fieldType: 'select',
                    dataSelectName: 'yesnodk'
                },
                {
                    rowNumber: 45,
                    required: false,
                    fieldName: 'q30_breast_fed',
                    questionText: '30. Is or did mother breast-feed (either totally or part-time)?',
                    requiredText: 'Question 30',
                    fieldType: 'select',
                    dataSelectName: 'yesnodk'
                },
                {
                    rowNumber: 46,
                    required: false,
                    fieldName: 'q31_prenatal_care',
                    questionText: '31. What prenatal care did the mother receive?',
                    requiredText: 'Question 31',
                    fieldType: 'select',
                    dataSelectName: 'prenatalcare'
                },
                {
                    rowNumber: 47,
                    required: false,
                    fieldName: 'comments',
                    questionText: 'Comments:',
                    fieldType: 'textarea'
                }
            ];

            this.$.childAssessmentQuestions.selectEndpoints = [
                {
                    endpoint: 'api/v1/ref/frequency-scale/',
                    name: 'frequency',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/yes-no-dk/',
                    name: 'yesnodk',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/asq-screening-age/',
                    name: 'asqscreeningage',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/asqse-dev-status/',
                    name: 'asqsedevstatus',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/asqse-screening-age/',
                    name: 'asqsescreeningage',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/immunization-status/',
                    name: 'immunizationstatus',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/child-height/',
                    name: 'childheight',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/child-weight/',
                    name: 'childweight',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/quality-scale/',
                    name: 'qualityscale',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
                {
                    endpoint: 'api/v1/ref/prenatal-care/',
                    name: 'prenatalcare',
                    nullRow: true,
                    parseWith: this.$.selectHelper.parseGenericRefTable
                },
            ];

            this.$.childAssessmentQuestions.createAssessment();
        },

        changeAlertHandler: function (inSender, inEvent) {
            enyo.log(inEvent.model);
        }

	})

})(enyo, this);
