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

(function (enyo, scope) {

	enyo.kind({

		name: 'oarn.MainToolbar',

		kind: 'enyo.Control',

		published: {

			toolbarState: '',

			disabled: false,

			dirty: false
		},

		components: [
			{name: 'btnFamilyDetails', kind: 'onyx.Button', content: 'Family Details',
				showing: false, ontap: 'tapHandler', classes: 'oarn-toolbar-button'},
			{name: 'btnEnrollment', kind: 'onyx.Button', content: 'Enrollment',
				showing: false, ontap: 'tapHandler', classes: 'oarn-toolbar-button'},
			{name: 'btnHomeVisits', kind: 'onyx.Button', content: 'Home Visits',
				showing: false, ontap: 'tapHandler', classes: 'oarn-toolbar-button'},
			{name: 'btnContactLog', kind: 'onyx.Button', content: 'Contact Log',
				showing: false, ontap: 'tapHandler', classes: 'oarn-toolbar-button'},
			{name: 'menuFamilyAssessments', onSelect: 'selectHandler', kind: 'onyx.MenuDecorator',
				showing: false, classes: 'oarn-toolbar-button', components: [
				{content: 'Family Assessments'},
				{kind: 'onyx.Menu', components: [
					{content: 'Family Assessment', style: 'width: 300px', classes: 'oarn-control'},
					{content: 'Risk Factor Assessment', style: 'width: 300px', classes: 'oarn-control'}
				]}
			]},
            {name: 'menuFamilyOptions', onSelect: 'selectHandler', kind: 'onyx.MenuDecorator',
                showing: false, classes: 'oarn-toolbar-button', components: [
                {content: 'Family Options'},
                {kind: 'onyx.Menu', components: [
                    {content: 'Waitlist', style: 'width: 300px', classes: 'oarn-control'},
                    {content: 'Create Child Record', style: 'width: 300px', classes: 'oarn-control'},
                    {content: 'Link Existing Child Record to this Family',
                        style: 'width: 300px', classes: 'oarn-control'},
                    {content: 'Create Adult Record', style: 'width: 300px', classes: 'oarn-control'},
                    {content: 'Link Existing Adult Record to this Family',
                        style: 'width: 300px', classes: 'oarn-control'},
                ]}
            ]},
			{name: 'btnAdultDetails', kind: 'onyx.Button', content: 'Adult Details',
				showing: false, ontap: 'tapHandler', classes: 'oarn-toolbar-button'},
			{name: 'btnChildDetails', kind: 'onyx.Button', content: 'Child Details',
				showing: false, ontap: 'tapHandler', classes: 'oarn-toolbar-button'},
			{name: 'menuChildAssessments', onSelect: 'selectHandler', kind: 'onyx.MenuDecorator',
				showing: false, classes: 'oarn-toolbar-button', components: [
				{content: 'Child Assessments'},
				{kind: 'onyx.Menu', components: [
					{content: 'Child Assessment', style: 'width: 300px', classes: 'oarn-control'},
					{content: 'ASQ3', classes: 'oarn-control', style: 'width: 300px'},
					{content: 'ASQ:SE', classes: 'oarn-control', style: 'width: 300px'}
				]}
			]},
		],

		events: {
			onBtnFamilyDetailsClicked: '',
			onBtnEnrollmentClicked: '',
			onBtnHomeVisitsClicked: '',
			onBtnContactLogClicked: '',
			onBtnAdultDetailsClicked: '',
			onBtnChildDetailsClicked: '',
			onFamilyAssessmentSelected: '',
			onRiskFactorAssessmentSelected: '',
			onChildAssessmentSelected: '',
            onASQSelected: '',
            onASQSESelected: '',
			onConfirmationNeeded: '',
            onCreateChildSelected: '',
            onLinkChildSelected: '',
            onCreateAdultSelected: '',
            onLinkAdultSelected: '',
            onWaitlistSelected: ''
		},

		tapHandler: function (inSender, inEvent) {
			if (this.get('.dirty')) {
				this.doConfirmationNeeded({'index': -1, 'toolbarSelection': inEvent.originator.name});
				return;
			}

			if (inEvent.originator.name === 'btnFamilyDetails') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.addClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');

				this.doBtnFamilyDetailsClicked();
			}
			else if (inEvent.originator.name === 'btnEnrollment') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.addClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');

				this.doBtnEnrollmentClicked();
			}
			else if (inEvent.originator.name === 'btnHomeVisits') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.addClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');

				this.doBtnHomeVisitsClicked();
			}
			else if (inEvent.originator.name === 'btnContactLog') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.addClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');

				this.doBtnContactLogClicked();
			}
			else if (inEvent.originator.name === 'btnAdultDetails') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.show();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.addClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');

				this.doBtnAdultDetailsClicked();
			}
			else if (inEvent.originator.name === 'btnChildDetails') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.show();
				this.$.menuChildAssessments.show();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.addClass('onyx-affirmative');

				this.doBtnChildDetailsClicked();
			}
			else {
				enyo.log('unknown oarn.MainToolbar tap event')
			}
		},

		setToolbarState: function (state) {
			this.set('toolbarState', state);

			if (state === 'none') {
				this.$.btnFamilyDetails.hide();
				this.$.btnEnrollment.hide();
				this.$.btnHomeVisits.hide();
				this.$.btnContactLog.hide();
				this.$.menuFamilyAssessments.hide();
                this.$.menuFamilyOptions.hide();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();
			}
			else if (state === 'family-none-selected') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');
			}
			else if (state === 'family') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.addClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');
			}
			else if (state === 'adult') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.show();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.addClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');
			}
			else if (state === 'child') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.show();
				this.$.menuChildAssessments.show();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.addClass('onyx-affirmative');
			}
			else if (state === 'child-none-selected') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
                this.$.menuFamilyOptions.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.show();
				this.$.menuChildAssessments.show();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');
			}
		},

		selectHandler: function (inSender, inEvent) {
			if (this.get('.dirty') && (
					(inEvent.originator.content == 'Family Assessment') ||
					(inEvent.originator.content == 'Risk Factor Assessment') ||
					(inEvent.originator.content == 'Child Assessment')
				)) {
				this.doConfirmationNeeded({'index': -1, 'toolbarSelection': inEvent.originator.content});
				return;
			}

			if (inEvent.originator.content == 'Family Assessment') {
				this.doFamilyAssessmentSelected();
			}
			else if (inEvent.originator.content == 'Risk Factor Assessment') {
				this.doRiskFactorAssessmentSelected();
			}
			else if (inEvent.originator.content == 'Child Assessment') {
				this.doChildAssessmentSelected();
			}
            else if (inEvent.originator.content == 'ASQ3') {
                this.doASQSelected();
            }
            else if (inEvent.originator.content == 'ASQ:SE') {
                this.doASQSESelected();
            }
            else if (inEvent.originator.content == 'Create Child Record') {
                this.doCreateChildSelected();
            }
            else if (inEvent.originator.content == 'Link Existing Child Record to this Family') {
                this.doLinkChildSelected();
            }
            else if (inEvent.originator.content == 'Create Adult Record') {
                this.doCreateAdultSelected();
            }
            else if (inEvent.originator.content == 'Link Existing Adult Record to this Family') {
                this.doLinkAdultSelected();
            }
            else if (inEvent.originator.content == 'Waitlist') {
                this.doWaitlistSelected();
            }
			else {
				enyo.log(inEvent.originator.content + ': not implemented at this time');
			}
		},

		disabledChanged: function(inOldVal) {
			this.$.btnFamilyDetails.setDisabled(this.get('.disabled'));
			this.$.btnEnrollment.setDisabled(this.get('.disabled'));
			this.$.btnHomeVisits.setDisabled(this.get('.disabled'));
			this.$.btnContactLog.setDisabled(this.get('.disabled'));
			this.$.btnAdultDetails.setDisabled(this.get('.disabled'));
			this.$.btnChildDetails.setDisabled(this.get('.disabled'));
		},

		select: function(item) {
			if (item === 'btnFamilyDetails') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.addClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');

				this.doBtnFamilyDetailsClicked();
			}
			else if (item === 'btnEnrollment') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.addClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');

				this.doBtnEnrollmentClicked();
			}
			else if (item === 'btnHomeVisits') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.addClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');

				this.doBtnHomeVisitsClicked();
			}
			else if (item === 'btnContactLog') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.addClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');

				this.doBtnContactLogClicked();
			}
			else if (item === 'btnAdultDetails') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
				this.$.btnAdultDetails.show();
				this.$.btnChildDetails.hide();
				this.$.menuChildAssessments.hide();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.addClass('onyx-affirmative');
				this.$.btnChildDetails.removeClass('onyx-affirmative');

				this.doBtnAdultDetailsClicked();
			}
			else if (item === 'btnChildDetails') {
				this.$.btnFamilyDetails.show();
				this.$.btnEnrollment.show();
				this.$.btnHomeVisits.show();
				this.$.btnContactLog.show();
				this.$.menuFamilyAssessments.show();
				this.$.btnAdultDetails.hide();
				this.$.btnChildDetails.show();
				this.$.menuChildAssessments.show();

				this.$.btnFamilyDetails.removeClass('onyx-affirmative');
				this.$.btnEnrollment.removeClass('onyx-affirmative');
				this.$.btnHomeVisits.removeClass('onyx-affirmative');
				this.$.btnContactLog.removeClass('onyx-affirmative');
				this.$.btnAdultDetails.removeClass('onyx-affirmative');
				this.$.btnChildDetails.addClass('onyx-affirmative');

				this.doBtnChildDetailsClicked();
			}
			else if (item === 'Family Assessment') {
				this.doFamilyAssessmentSelected();
			}
			else if (item === 'Risk Factor Assessment') {
				this.doRiskFactorAssessmentSelected();
			}
			else if (item === 'Child Assessment') {
				this.doChildAssessmentSelected();
			}
		}
	});

})(enyo, this);