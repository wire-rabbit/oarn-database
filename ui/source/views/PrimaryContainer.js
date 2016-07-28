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

(function (enyo,scope) {

    /**
     * {@link oarn.PrimaryContainer} is the top level of the OARN database UI.
     *
     * @class oarn.PrimaryContainer
     * @extends enyo.FittableRows
     * @ui
     * @public
     */
    enyo.kind(
        /** @lends oarn.PrimaryContainer.prototype */{

        /**
         * @private
         */
        name: 'oarn.PrimaryContainer',

        /**
         * @private
         */
        kind: "enyo.FittableRows",

        /**
         * Controls listed here (by name rather than type) will trigger a full screen spinner when
         * an ajax event is caught by this control.
         *
         * @private
         */
        fullScreenSpinnerControls: [
            'foundFamilies',
            'familyDetails',
            'caseManagers',
            'familyAddresses',
            'newFamilyNewAdultPopup',
            'familyNotes',
            'familyPrograms',
            'personEnrollment',
            'serviceLevelEnrollment',
            'familyHomeVisits',
            'personDetails',
            'personDemographics',
            'personLanguages',
            'personTelephone',
            'personEmail',
            'adultFamilyRelationships',
            'childFamilyRelationships',
            'familyContactLog',
            'selectHelper',
            'repeaterDisplay',
            'familyRecordCreator',
            'childRecordCreator',
            'childLinkCreator',
            'adultRecordCreator',
            'adultLinkCreator',
            'familyAssessmentQuestions',
            'childAssessmentQuestions',
            'riskFactorAssessmentQuestions',
            'waitlistQuestions',
            'classRepeaterDisplay',
            'classroomRepeaterDisplay',
            'scheduleRepeaterDisplay',
            'detailsDisplay',
            'attendance',
            'classroomAssignment'
        ],

        /**
         * When handling confirmations about leaving a view when the controls are dirty,
         * this object stores details about which control is being queried.
         *
         * @private
         */
        lockDetails: {control:'', index:'', toolbarSelection: ''},

        familyDetailsDirty: false,
        adultDetailsDirty: false,
        childDetailsDirty: false,

        /**
         * @lends oarn.PrimaryContainer.prototype
         * @public
         */
        published: {

            version: '1.7.0',

            /**
             * The authentication token retrieved from the back-end. The idea is for
             * child components to bind to this for their own authentication. If the
             * token is set to an empty string the login popup will reappear.
             *
             * @type {String}
             * @default null
             * @public
             */
            token: null,

            /**
             * The oarn API object, instantiated in create.
             *
             * @type {Object}
             * @public
             */
            api: null,

            /**
             * The username, stored after login.
             *
             * @type {String}
             * @default 'none'
             * @public
             */
            username: 'none',

            /**
             * The person_id of the selected person in the search results pane.
             *
             * @type {Number}
             * @default 0
             * @public
             */
            selectedPersonID: 0,

            /**
             * Contains the selected row from the enyo.DataRepeater in the search results pane.
             *
             * @type {Object}
             * @default null
             * @public
             */
            selectedPersonItem: null,

            /**
             * The family_id of the family selected in the oarn.FoundFamilies control.
             *
             * @type {Number}
             * @default 0
             * @public
             */
            selectedFamilyID: 0,

            /**
             * The adult_id of the person selected in the oarn.FamilyAdults control.
             *
             * @type {Number}
             * @default 0
             * @public
             */
            selectedAdultID: 0,

            /**
             * The child_id of the person selected in the oarn.FamilyChildren control.
             *
             * @tpye {Number}
             * @default 0
             * @public
             */
            selectedChildID: 0,

            /**
             * The selected enyo.DataRepeater row from oarn.FoundFamilies.
             *
             * @type {Object}
             * @default null
             * @public
             */
            selectedFamilyItem: null,

            /**
             * The organization of the logged in user, set to an object in the format:
             * {'organization_id': (number), 'name': 'foo', 'short_name': 'bar'}
             * If a user has rights to multiple organizations, they will be asked to select one
             * for the current session at login.
             *
             * @type {Object}
             * @default null
             * @public
             */
            selectedOrganization: null,

            /**
             * A list of objects describing the current user's access rights.
             *
             * @type {Array}
             * @default null
             * @public
             */
            organizationAccessList: null,

            /**
             * Indicates whether the current user has readonly rights to the session's selected organization.
             *
             * @type {Boolean}
             * @default false
             * @public
             */
            currentOrgReadOnly: false,

            /**
             * Indicates whether the current user has read/write rights to the session's selected organization.
             *
             * @type {Boolean}
             * @default false
             * @public
             */
            currentOrgReadWrite: false,

            /**
             * Indicates whether the current user has admin rights to the session's selected organization.
             *
             * @type {Boolean}
             * @default false
             * @public
             */
            currentOrgAdmin: false
        },

        /**
         * @private
         */
        handlers: {
            onAjaxError: 'ajaxErrorHandler',

            onAjaxStarted: 'ajaxStartedHandler',

            onAjaxFinished: 'ajaxFinishedHandler',

            onActiveOrganizationChanged: 'activeOrganizationChangedHandler',

            onSelectedPersonChanged: 'selectedPersonChangedHandler',

            onSelectedFamilyChanged: 'selectedFamilyChangedHandler',

            onSelectedAdultChanged: 'selectedAdultChangedHandler',

            onSelectedChildChanged: 'selectedChildChangedHandler',

            onFamilyDetailsDirtyStateChanged: 'familyDetailsDirtyStateChangedHandler',

            onAdultDetailsDirtyStateChanged: 'adultDetailsDirtyStateChangedHandler',

            onChildDetailsDirtyStateChanged: 'childDetailsDirtyStateChangedHandler',

            onHomeVisitDetailsDirtyStateChanged: 'homeVisitDetailsDirtyStateChangedHandler',

            onContactLogDetailsDirtyStateChanged: 'contactLogDetailsDirtyStateChangedHandler',

            onFamilyAssessmentDirtyStateChanged: 'familyAssessmentDirtyStateChangedHandler',

            onChildAssessmentDirtyStateChanged: 'childAssessmentDirtyStateChangedHandler',

            onRiskFactorAssessmentDirtyStateChanged: 'riskFactorAssessmentDirtyStateChangedHandler',

            onWaitlistDirtyStateChanged: 'waitlistDirtyStateChangedHandler',

            onASQDirtyStateChanged: 'asqDirtyStateChangedHandler',

            onASQSEDirtyStateChanged: 'asqseDirtyStateChangedHandler',

            onConfirmationNeeded: 'confirmationNeededHandler',

            onPopupClosed: 'popupClosedHandler',

            onDuplicateSelected: 'duplicateSelectedHandler',

            onFamilyCreated: 'familyCreatedHandler',

            onFamilyOptionPopupClosed: 'familyOptionPopupClosed',

            onFamilyRefreshed: 'familyRefreshedHandler',

            onFamilySelected: 'familySelectedHandler',

            onClassroomManagerClosed: 'classroomManagerClosedHandler',

            onUserManagerClosed: 'userManagerClosedHandler',

            onAttendanceClosed: 'attendanceClosedHandler',

            // Toolbar Menu Option Handlers:
            onBtnFamilyDetailsClicked: 'btnFamilyDetailsClickedHandler',

            onBtnEnrollmentClicked: 'btnEnrollmentClickedHandler',

            onBtnHomeVisitsClicked: 'btnHomeVisitsClickedHandler',

            onBtnContactLogClicked: 'btnContactLogClickedHandler',

            onBtnAdultDetailsClicked: 'btnAdultDetailsClickedHandler',

            onBtnChildDetailsClicked: 'btnChildDetailsClickedHandler',

            onFamilyAssessmentSelected: 'btnFamilyAssessmentSelectedHandler',

            onRiskFactorAssessmentSelected: 'btnRiskFActorAssessmentSelectedHandler',

            onChildAssessmentSelected: 'btnChildAssessmentSelectedHandler',

            onASQSelected: 'btnASQSelectedHandler',

            onASQSESelected: 'btnASQSESelectedHandler',

            onCreateChildSelected: 'createChildSelectedHandler',

            onLinkChildSelected: 'linkChildSelectedHandler',

            onCreateAdultSelected: 'createAdultSelectedHandler',

            onLinkAdultSelected: 'linkAdultSelectedHandler',

            onWaitlistSelected: 'waitlistSelectedHandler'
        },

        /**
         * @private
         */
        components: [

            {kind: 'enyo.Signals', onkeydown: 'handleKeyDown'},

            {
                name: 'mainToolbar', kind: 'onyx.MoreToolbar',

                /**
                 * An array of buttons and menus dynamically added to/removed from the toolbar
                 *
                 * @private
                 */
                toolbarControls: [],

                /**
                 * A string indicating which of the available toolsets is currently displayed
                 *
                 * @private
                 */
                toolbarShowing: '',

                components: [
                    // **************************************************************
                    // ********************** Tool Bar ******************************
                    // **************************************************************
                        {name: 'searchTypeMenu', kind: 'oarn.SearchTypePicker', onSelect: 'searchTypeChanged'},
                    {
                        kind: 'onyx.InputDecorator', components: [
                        {
                            name: 'searchBox',
                            kind: 'onyx.Input',
                            placeholder: 'Enter search terms...',
                            oninput: 'searchBoxInput'
                        },
                        {
                            name: 'searchButton',
                            kind: 'onyx.IconButton',
                            src: 'static/assets/search-small.png',
                            classes: 'oarn-icon-button',
                            ontap: 'goSearch'
                        }
                    ]
                    },

                    {
                        kind: 'onyx.MenuDecorator',
                        classes: 'oarn-control',
                        onSelect: 'optionMenuItemSelected',
                        components: [
                            {content: 'Options'},
                            {
                                kind: 'onyx.Menu', components: [
                                {
                                    name: 'btnCreateFamily',
                                    content: 'Create Family',
                                    classes: 'oarn-control',
                                    ontap: 'createFamily'
                                },
                                {
                                    name: 'btnManageClassrooms',
                                    content: 'Manage Classrooms',
                                    classes: 'oarn-control',
                                    ontap: 'manageClassrooms',
                                    showing: false
                                },
                                {
                                    name: 'btnAttendance',
                                    content: 'Attendance',
                                    classes: 'oarn-control',
                                    ontap: 'showAttendance'
                                },
                                {
                                    name: 'btnManageUsers',
                                    content: 'Manage Users',
                                    classes: 'oarn-control',
                                    ontap: 'manageUsers',
                                    showing: false
                                },
                                {   name: 'menuActiveOrg',
                                    content: '', ontap: 'menuActiveOrgSelected',
                                    allowHtml: true, classes: 'oarn-control',
                                    style:'width:300px;'
                                },
                                {classes: "onyx-menu-divider"},
                                {   name: 'menuAbout',
                                    content: 'About the OARN Database',
                                    ontap: 'menuAboutSelected',
                                    classes: 'oarn-control'
                                }
                            ]
                            }
                        ]
                    },

                    {kind: 'onyx.Grabber', style: 'margin-left:20px'},

                    {name: 'mainTools', kind: 'oarn.MainToolbar'}
                ],

                /**
                 * @private
                 */
                events: {
                    onToolSelected: '' // caught by oarn.PrimaryContainer - this is triggered by the toolbar selection
                }

            },

            {
                name: 'mainPanels', kind: "enyo.Panels", fit: true, arrangerKind: 'CollapsingArranger',
                classes: "oarn-primary-container-panels", components: [

                {name: 'searchPanel', kind: 'enyo.FittableRows', components: [
                    // Search results...
                    {kind: 'enyo.Scroller', fit:true, components: [
                        // **************************************************************
                        // ********************** SEARCH PANEL **************************
                        // **************************************************************
                        {name: 'searchResults', kind: 'oarn.PersonSearchResults'}


                        // **************************************************************
                    ]},

                    {kind: 'onyx.Toolbar', classes: 'onyx-menu-toolbar', components: [
                        {kind: 'onyx.Grabber'}
                    ]}
                ]},

                {name: 'familyPanel', kind: 'enyo.FittableRows', components: [
                    {kind: 'enyo.Scroller', fit:true, components: [
                        // **************************************************************
                        // ********************** FAMILY PANEL **************************
                        // **************************************************************
                        {name: 'foundFamilies', kind: 'oarn.FoundFamilies'},
                        {name: 'foundAdults', kind: 'oarn.FamilyAdults'},
                        {name: 'foundChildren', kind: 'oarn.FamilyChildren'}


                        // **************************************************************
                    ]},
                    {kind: 'onyx.Toolbar', classes: 'onyx-menu-toolbar', components: [
                        {kind: 'onyx.Grabber'}
                    ]},

                ]},

                {name: 'detailsPanel', kind: 'enyo.FittableRows', components: [
                    {kind: 'enyo.Scroller', fit: true, components: [
                        {name: 'detailsDrawer', kind: 'enyo.Drawer',
                            fit: true, animated: true,  components: [

                            // **************************************************************
                            // ********************** DETAILS PANEL *************************
                            // **************************************************************

                            ]
                        }
                    ]},
                    {kind: 'onyx.Toolbar', classes: 'onyx-menu-toolbar', components: [
                        {kind: 'onyx.Grabber'}
                    ]}
                ]},

            ]},
            {name: 'infoPopup', kind: 'onyx.Popup', centered: true,
                floating: true, components: [
                {name: 'infoTitle', content:'', classes: 'oarn-popup-title'},
                {name: 'infoBody', kind: 'Scroller', style: 'width:300px', maxHeight:'200px', components: [
                    {name: 'infoDetail', allowHtml:true}
                ]}
            ]},
            {
                kind: "oarn.LoginPopup", name: "loginPopup", onTokenChanged: 'newTokenReceived'
            },
            {name: 'fullScreenSpinner', kind: 'onyx.Popup', centered: true, floating: true,
                scrim: true, autoDismiss:false, components: [
                    {kind: 'onyx.Spinner'},
            ]},

            {name: 'popupFactory', kind: 'oarn.PopupFactory'}

        ],

        /**
         * @private
         */
        bindings: [
            // Binding the API token to data-aware child controls:
            {from: '.token', to: '.api.token'},
            {from: '.token', to: '.$.searchResults.token'},
            {from: '.token', to: '.$.foundFamilies.token'},
            {from: '.token', to: '.$.familyDetails.token'},
            {from: '.token', to: '.$.adultDetails.token'},
            {from: '.token', to: '.$.childDetails.token'},
            {from: '.token', to: '.$.enrollmentDetails.token'},
            {from: '.token', to: '.$.homeVisitDetails.token'},
            {from: '.token', to: '.$.contactLogDetails.token'},
            {from: '.token', to: '.$.familyAssessmentDetails.token'},
            {from: '.token', to: '.$.riskFactorAssessmentDetails.token'},
            {from: '.token', to: '.$.childAssessmentDetails.token'},
            {from: '.token', to: '.$.asqDetails.token'},
            {from: '.token', to: '.$.asqseDetails.token'},
            {from: '.token', to: '.$.familyRecordCreator.token'},
            {from: '.token', to: '.$.childRecordCreator.token'},
            {from: '.token', to: '.$.childLinkCreator.token'},
            {from: '.token', to: '.$.adultRecordCreator.token'},
            {from: '.token', to: '.$.adultLinkCreator.token'},
            {from: '.token', to: '.$.waitlist.token'},
            {from: '.token', to: '.$.classroomManager.token'},
            {from: '.token', to: '.$.attendance.token'},

            // Binding the username to controls that do timestamps, etc.:
            {from: '.username', to: '.$.familyDetails.username'},
            {from: '.username', to: '.$.enrollmentDetails.username'},
            {from: '.username', to: '.$.homeVisitDetails.username'},
            {from: '.username', to: '.$.contactLogDetails.username'},
            {from: '.username', to: '.$.familyAssessmentDetails.username'},
            {from: '.username', to: '.$.riskFactorAssessmentDetails.username'},
            {from: '.username', to: '.$.childAssessmentDetails.username'},
            {from: '.username', to: '.$.asqDetails.username'},
            {from: '.username', to: '.$.asqseDetails.username'},
            {from: '.username', to: '.$.waitlist.username'},

            // Binding org details to data-aware child controls:
            {from: '.selectedOrganization', to: '.$.familyDetails.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.familyDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.familyDetails.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.familyDetails.currentOrgAdmin'},

            {from: '.selectedOrganization', to: '.$.searchResults.selectedOrganization'},
            {from: '.selectedOrganization', to: '.$.adultLinkCreator.selectedOrganization'},
            {from: '.selectedOrganization', to: '.$.childLinkCreator.selectedOrganization'},
            {from: '.selectedOrganization', to: '.$.adultRecordCreator.selectedOrganization'},
            {from: '.selectedOrganization', to: '.$.childRecordCreator.selectedOrganization'},
            {from: '.selectedOrganization', to: '.$.familyRecordCreator.selectedOrganization'},
            {from: '.selectedOrganization', to: '.$.classroomManager.selectedOrganization'},

            {from: '.currentOrgReadOnly', to: '.$.familyRecordCreator.currentOrgReadOnly'},
            {from: '.currentOrgReadOnly', to: '.$.childRecordCreator.currentOrgReadOnly'},
            {from: '.currentOrgReadOnly', to: '.$.childLinkCreator.currentOrgReadOnly'},
            {from: '.currentOrgReadOnly', to: '.$.adultRecordCreator.currentOrgReadOnly'},
            {from: '.currentOrgReadOnly', to: '.$.adultLinkCreator.currentOrgReadOnly'},
            {from: '.currentOrgReadOnly', to: '.$.familyAssessmentDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadOnly', to: '.$.childAssessmentDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadOnly', to: '.$.asqDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadOnly', to: '.$.asqseDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadOnly', to: '.$.waitlist.currentOrgReadOnly'},

            {from: '.selectedOrganization', to: '.$.enrollmentDetails.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.enrollmentDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.enrollmentDetails.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.enrollmentDetails.currentOrgAdmin'},
            {from: '.selectedOrganization', to: '$.familyRecordCreator.selectedOrganization'},

            {from: '.selectedOrganization', to: '.$.homeVisitDetails.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.homeVisitDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.homeVisitDetails.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.homeVisitDetails.currentOrgAdmin'},

            {from: '.selectedOrganization', to: '.$.contactLogDetails.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.contactLogDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.contactLogDetails.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.contactLogDetails.currentOrgAdmin'},

            {from: '.selectedOrganization', to: '.$.familyAssessmentDetails.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.familyAssessmentDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.familyAssessmentDetails.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.familyAssessmentDetails.currentOrgAdmin'},

            {from: '.selectedOrganization', to: '.$.riskFactorAssessmentDetails.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.riskFactorAssessmentDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.riskFactorAssessmentDetails.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.riskFactorAssessmentDetails.currentOrgAdmin'},

            {from: '.selectedOrganization', to: '.$.childAssessmentDetails.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.childAssessmentDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.childAssessmentDetails.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.childAssessmentDetails.currentOrgAdmin'},

            {from: '.selectedOrganization', to: '.$.asqDetails.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.asqDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.asqDetails.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.asqDetails.currentOrgAdmin'},

            {from: '.selectedOrganization', to: '.$.asqseDetails.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.asqseDetails.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.asqseDetails.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.asqseDetails.currentOrgAdmin'},

            {from: '.selectedOrganization', to: '.$.childRecordCreator.selectedOrganization'},
            {from: '.selectedOrganization', to: '.$.childLinkCreator.selectedOrganization'},
            {from: '.selectedOrganization', to: '.$.adultRecordCreator.selectedOrganization'},
            {from: '.selectedOrganization', to: '.$.adultLinkCreator.selectedOrganization'},

            {from: '.selectedOrganization', to: '.$.waitlist.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.waitlist.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.waitlist.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.waitlist.currentOrgAdmin'},

            {from: '.selectedOrganization', to: '.$.attendance.selectedOrganization'},
            {from: '.currentOrgReadOnly', to: '.$.attendance.currentOrgReadOnly'},
            {from: '.currentOrgReadWrite', to: '.$.attendance.currentOrgReadWrite'},
            {from: '.currentOrgAdmin', to: '.$.attendance.currentOrgAdmin'},

            // Binding the currently selected person ID here and to child controls:
            {from: '.selectedPersonID', to: '.$.foundFamilies.selectedPersonID'},
            {from: '.selectedPersonItem', to: '.$.foundFamilies.selectedPersonItem'},
            {from: '.selectedPersonItem', to: '.$.childDetails.selectedPersonItem'},

            {from: '.selectedAdultID', to: '.$.adultDetails.selectedPersonID'},
            {from: '.selectedChildID', to: '.$.childDetails.selectedPersonID'},
            {from: '.selectedChildID', to: '.$.childAssessmentDetails.selectedChildID'},
            {from: '.selectedChildID', to: '.$.asqDetails.selectedChildID'},
            {from: '.selectedChildID', to: '.$.asqseDetails.selectedChildID'},

            // Binding the currently selected family ID here and to child controls:
            {from: '.selectedFamilyID', to: '.$.foundAdults.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.foundChildren.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.familyDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.adultDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.childDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.enrollmentDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.homeVisitDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.contactLogDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.familyAssessmentDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.childAssessmentDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.riskFactorAssessmentDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.asqDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.asqseDetails.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.childRecordCreator.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.childLinkCreator.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.adultRecordCreator.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.adultLinkCreator.selectedFamilyID'},
            {from: '.selectedFamilyID', to: '.$.waitlist.selectedFamilyID'},

            // Binding JSON snapshots to share among child controls:
            {from: '.$.foundFamilies.jsonSnapshot', to: '.$.foundAdults.jsonSnapshot'},
            {from: '.$.foundFamilies.jsonSnapshot', to: '.$.foundChildren.jsonSnapshot'}

        ],

        /**
         * @private
         */
        events: {
            onAjaxError: '',

            onFamilyOptionPopupClosed: '',

            onSelectedPersonChanged: ''
        },

        /**
         * @private
         */
        observers: [
            {method: 'dirtyStateChangeObserved', path: [
                'familyDetailsDirty',
                'adultDetailsDirty',
                'childDetailsDirty',
                'homeVisitDetailsDirty',
                'contactLogDetailsDirty',
                'familyAssessmentDirty',
                'childAssessmentDirty',
                'riskFactorAssessmentDirty',
                'asqDirty',
                'asqseDirty',
                'waitlistDirty'
            ]}
        ],

        /**
         * @method
         * @private
         */
        create: function () {
            this.inherited(arguments);

            var msg = 'Version: ' + this.get('.version');
            enyo.log(msg);
            enyo.log('Copyright 2015-2016 - Oregon Association of Relief Nurseries');

            this.api = new oarn.API();
        },

        /**
         * @method
         * @private
         */
        rendered: function () {
            this.inherited(arguments);
            this.set('token', '');

            if ((navigator.userAgent.indexOf('Firefox') == -1) &&
                (navigator.userAgent.indexOf('Chrome') == -1)) {
                this.$.popupFactory.showInfo('Unsupported Browser',
                "The OARN database currently supports only Firefox and Chrome. " +
                "Some features may not work as expected with your current browser.");
            }
        },

        /**
         * Child controls usually handle their own errors. Ajax errors not handled by children
         * will be addressed here.
         *
         * @method
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        ajaxErrorHandler: function (inSender, inEvent) {

            var status = inSender.xhrResponse.status;
            var detail = JSON.parse(inSender.xhrResponse.body);

            var detail_msg = '';
            for (var prop in detail) {
                if (detail.hasOwnProperty(prop)) {
                    detail_msg = prop + ': ' + detail[prop] + '<br>';
                }
            }

            if (status = 403) {
                this.$.popupFactory.showInfo('Permission Denied', 'This user account does not have ' +
                    'sufficient rights to perform this operation.');
            }
            else {
                this.$.popupFactory.showInfo('Database Communication Error', 'An error occurred while trying to ' +
                    ' retrieve data from the server. ' +
                    'Please provide the following information to your database administrator: ' +
                    '<br><br>' + 'status: ' + status + '<br>' + detail_msg);
            }

            this.set('.xhrResponse', inSender.xhrResponse);

            return true;
        },

        /**
         * When a new person is selected in the search results, existing selected families/adults/children
         * are deselected.
         *
         * @method
         * @private
         * @param inSender
         * @param inEvent
         * @returns {boolean}
         */
        selectedPersonChangedHandler: function (inSender, inEvent) {
            this.set('.selectedPersonItem', inEvent.item);
            this.set('.selectedPersonID', inEvent.id);
            this.set('.selectedFamilyID', 0);

            this.$.foundFamilies.deselectAll();
            this.$.foundAdults.deselectAll();
            this.$.foundChildren.deselectAll();

            return true;
        },

        /**
         * Destroys the contents of the details pane.
         *
         * @method
         * @private
         */
        clearDetailsPanelControls: function () {
            // It's possible that a helper within one of these controls has an uncleared 
            // spinner timeout pending. We should clean those up now:
            if (this.get('.spinnerDelay') != undefined) {
                    clearTimeout(this.spinnerDelay);
                    this.$.fullScreenSpinner.hide();
            }

            if ((this.$.familyDetails) && (this.$.familyDetails.hasNode())) {
                var childControls = this.$.familyDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.familyDetails.destroy();
            }

            if ((this.$.adultDetails) && (this.$.adultDetails.hasNode())) {
                var childControls = this.$.adultDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.adultDetails.destroy();
            }

            if ((this.$.childDetails) && (this.$.childDetails.hasNode())) {
                var childControls = this.$.childDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.childDetails.destroy();
            }

            if ((this.$.enrollmentDetails) && (this.$.enrollmentDetails.hasNode())) {
                var childControls = this.$.enrollmentDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.enrollmentDetails.destroy();
            }

            if ((this.$.homeVisitDetails) && (this.$.homeVisitDetails.hasNode())) {
                var childControls = this.$.homeVisitDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.homeVisitDetails.destroy();
            }

            if ((this.$.contactLogDetails) && (this.$.contactLogDetails.hasNode())) {
                var childControls = this.$.contactLogDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.contactLogDetails.destroy();
            }

            if ((this.$.familyAssessmentDetails) && (this.$.familyAssessmentDetails.hasNode())) {
                var childControls = this.$.familyAssessmentDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.familyAssessmentDetails.destroy();
            }

            if ((this.$.riskFactorAssessmentDetails) && (this.$.riskFactorAssessmentDetails.hasNode())) {
                var childControls = this.$.riskFactorAssessmentDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.riskFactorAssessmentDetails.destroy();
            }

            if ((this.$.childAssessmentDetails) && (this.$.childAssessmentDetails.hasNode())) {
                var childControls = this.$.childAssessmentDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.childAssessmentDetails.destroy();
            }

            if ((this.$.asqDetails) && (this.$.asqDetails.hasNode())) {
                var childControls = this.$.asqDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.asqDetails.destroy();
            }

            if ((this.$.asqseDetails) && (this.$.asqseDetails.hasNode())) {
                var childControls = this.$.asqseDetails.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.asqseDetails.destroy();
            }

            if ((this.$.waitlist) && (this.$.waitlist.hasNode())) {
                var childControls = this.$.waitlist.getControls();
                for (var i = 0, ctrl; ctrl = childControls[i]; i++) {
                    ctrl.destroy()
                };
                this.$.waitlist.destroy();
            }
        },

        /**
         * When a new family is selected, the menu bar must be changed and a selected adult or child
         * record (if any) must be deselected.
         *
         * @method
         * @private
         * @param oldVal
         * @param newVal
         * @returns {boolean}
         */
        selectedFamilyIDChanged: function (oldVal, newVal) {
            this.clearDetailsPanelControls();

            if (this.get('.selectedFamilyID') != 0) {
                this.$.mainTools.setToolbarState('family');

                this.$.foundChildren.deselectAll();
                this.$.foundAdults.deselectAll();

                this.$.detailsDrawer.createComponent({name: 'familyDetails', kind: 'oarn.FamilyDetails'},
                    {owner:this});
                this.$.detailsDrawer.render();

            } else {
                this.$.mainTools.setToolbarState('none');
            }
            return true;
        },

        /**
         * When a new adult is selected, set the details pane and the toolbar state.
         *
         * @method
         * @private
         * @param inSender
         * @param inEvent
         */
        selectedAdultChangedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.set('.selectedAdultID', inEvent.id);

            if (inEvent.id != 0) {
                this.$.mainTools.setToolbarState('adult')
                this.$.foundChildren.deselectAll();

                this.$.detailsDrawer.createComponent({name: 'adultDetails', kind: 'oarn.AdultDetails'},
                    {owner: this});
                this.$.detailsDrawer.render();
            }
            else {
                if (!inEvent.noMenuChange) {
                    this.$.mainTools.setToolbarState('family');

                    this.$.detailsDrawer.createComponent({name: 'familyDetails', kind: 'oarn.FamilyDetails'},
                        {owner:this});
                    this.$.detailsDrawer.render();
                }
            }

        },

        /**
         * When a new child is selected, set the details pane and the toolbar state.
         *
         * @method
         * @private
         * @param inSender
         * @param inEvent
         */
        selectedChildChangedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.set('.selectedChildID', inEvent.id);

            if (inEvent.id != 0) {
                this.$.mainTools.setToolbarState('child');
                this.$.foundAdults.deselectAll();

                this.$.detailsDrawer.createComponent({name: 'childDetails', kind: 'oarn.ChildDetails'},
                    {owner: this});
                this.$.detailsDrawer.render();
            }
            else {
                if (!inEvent.noMenuChange) {
                    this.$.mainTools.setToolbarState('family');

                    this.$.detailsDrawer.createComponent({name: 'familyDetails', kind: 'oarn.FamilyDetails'},
                        {owner:this});
                    this.$.detailsDrawer.render();
                }
            }
        },

        /**
         * Triggered when the control's token is set to a new value.
         * If this value is an empty string, it triggers the login popup.
         *
         * @method
         * @private
         * @param inOldValue
         */
        tokenChanged: function (inOldValue) {
            this.$.loginPopup.show();
            if (this.get('token') === '') {
                this.$.mainPanels.setIndex(2);
                this.$.detailsDrawer.setOpen(false);
                this.$.loginPopup.show();
            }
            else {
                if (this.$.loginPopup.showing) {
                    this.$.loginPopup.hide();

                    this.$.mainPanels.setIndex(0);
                    this.$.detailsDrawer.setOpen(true);

                    this.set('.selectedOrganization', null, true);
                }
            }

        },

        /**
         * Handles the <code>onTokenChanged</code> event for the [oarn.LoginPopup]{@link oarn.LoginPopup}
         * component. Its task is simply to set the control's token to its new value.
         *
         * @method
         * @private
         * @param inSender
         * @param inEvent
         */
        newTokenReceived: function (inSender, inEvent) {
            this.set('token', inEvent.token);
            this.set('username', inEvent.username);
        },

        /**
         * When the user begins typing in the searchBox input, the search results panel
         * is displayed (if it isn't already showing).
         *
         * @method
         * @private
         * @param inSender
         * @param inEvent
         */
        searchBoxInput: function(inSender, inEvent) {
            if (this.$.mainPanels.getIndex() > 0) {
                this.$.mainPanels.setIndex(0);
            }
        },

        /**
         * Capture 'enter' key hits from the search box.
         *
         * @method
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        handleKeyDown: function (inSender, inEvent) {
            if (this.$.searchBox.hasFocus()) {
                if (inEvent.keyCode == 13) {
                    this.goSearch(inSender, inEvent);
                }
                return true; // stop propagation
            }
            return false; // continue propagation
        },

        /**
         * Perform a search for individuals
         *
         * @method
         * @private
         * @param inSender
         * @param inEvent
         */
        goSearch: function (inSender, inEvent) {
            if (this.get('.$.searchTypeMenu.selectedItem') != '') {
                this.set('.$.searchResults.searchType', this.get('.$.searchTypeMenu.selectedItem'));
                this.set('.$.searchResults.searchFor', this.get('.$.searchBox.value'));
                this.$.searchResults.goSearch();
            }
            else {
                this.set('.$.infoTitle.content', 'Search Help');
                this.set('.$.infoDetail.content', 'Please select a search type from the drop-down menu ' +
                    'before searching.');
                this.$.infoPopup.show();
            }
        },

        /**
         * Turn on spinners for controls while we wait for a result from the server.
         *
         * @method
         * @param inSender
         * @param inEvent
         * @private
         */
        ajaxStartedHandler: function (inSender, inEvent) {
            if (inEvent.originator.name == 'searchResults') {
                this.set('.$.searchButton.src', 'static/assets/ajax-loader.gif');
            }
            else if (this.fullScreenSpinnerControls.indexOf(inEvent.originator.name) > -1) {
                // We don't want full screen flashing of the spinner, so only turn it on if
                // the delay is more than half a second. The 'this.spinnerDelay' variable is
                // only used here and in ajaxFinishedHandler, below, so I don't want to
                // declare it openly on the kind itself.
                if (this.get('.spinnerDelay') != undefined) {
                    clearTimeout(this.spinnerDelay); // we don't want multiple timeouts overlapping
                }
                this.set('.spinnerDelay',setTimeout(enyo.bind(this, 'showFullScreenSpinner'), 500));
            }
            else {
                enyo.log('unlogged full screen spinner control name:' + inEvent.originator.name);
            }
            return true;
        },

        /**
         * @method
         * @private
         */
        showFullScreenSpinner: function () {
            this.$.fullScreenSpinner.show();
        },

        /**
         * Turn off spinners for controls after having received a result from the server.
         *
         * @method
         * @private
         * @param inSender
         * @param inEvent
         *
         */
        ajaxFinishedHandler: function (inSender, inEvent) {
            if (inEvent.originator.name == 'searchResults') {
                this.set('.$.searchButton.src', 'static/assets/search-small.png')
            }
            else if (this.fullScreenSpinnerControls.indexOf(inEvent.originator.name) > -1) {
                clearTimeout(this.spinnerDelay);
                this.$.fullScreenSpinner.hide();
            }
            return true;
        },

        /**
         * If the selected organization object is changed, we need to pull data from the
         * server to find out what the new organization options and access rights are.
         *
         * @method
         * @private
         * @param inOldVal
         */
        selectedOrganizationChanged: function (inOldVal) {
            if (this.get('.selectedOrganization') == null) {
                this.set('.api.method', 'GET');
                var endpoint = 'api/v1/organization/access/';
                var ajax = this.api.getAjaxObject(endpoint);
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'processSelectedOrganizationResponse'));
                ajax.error(enyo.bindSafely(this, 'selectedOrganizationAjaxError')); // we can share error handling
            }
        },

        /**
         * The callback for selectedOrganizationChanged(). If no orgs are retrieved, it prevents
         * the user from continuing. If one is received, it simply sets up the needed variables and
         * begins. If more than one is received, the user is prompted to select one.
         *
         * @method
         * @private
         * @param inRequest
         * @param inResponse
         */
        processSelectedOrganizationResponse: function (inRequest, inResponse) {
            if (inResponse['results'].length == 0) {
                this.$.infoTitle.content = 'No Access';
                this.$.infoDetail.content = 'Although an account has been set up for this user, ' +
                        'no organizational access has been configured. Please contact your database ' +
                        'administrator for assistance.';
                this.$.infoPopup.setScrim(true);
                this.$.infoPopup.setModal(true);
                this.$.infoPopup.setAutoDismiss(false);
                this.$.infoPopup.show();
            }
            else if (inResponse['results'].length == 1) {
                this.set('.selectedOrganization', {
                    'organization_id': inResponse['results'][0].organization_id,
                    'name': inResponse['results'][0].name,
                    'short_name': inResponse['results'][0].short_name
                });

                if (inResponse['results'][0].access_type == 'read') {
                    this.set('.currentOrgReadOnly', true);
                    this.set('.currentOrgReadWrite', false);
                    this.set('.currentOrgAdmin', false);
                }
                else if (inResponse['results'][0].access_type == 'write') {
                    this.set('.currentOrgReadOnly', false);
                    this.set('.currentOrgReadWrite', true);
                    this.set('.currentOrgAdmin', false);
                }
                else if (inResponse['results'][0].access_type == 'admin') {
                    this.set('.currentOrgReadOnly', false);
                    this.set('.currentOrgReadWrite', false);
                    this.set('.currentOrgAdmin', true);
                }
                else {
                    this.set('.currentOrgReadOnly', false);
                    this.set('.currentOrgReadWrite', false);
                    this.set('.currentOrgAdmin', false);
                }
                this.set('.$.menuActiveOrg.content', 'Set Active Organization (Currently: <em>' +
                    inResponse['results'][0].short_name + '</em>)')
                return;
            }
            else if (inResponse['results'].length > 1) {

                var popup = this.createComponent({
                    name: 'organizationSelectPopup',
                    kind: 'oarn.OrganizationSelectPopup'
                });

                var accessList = [];
                var options_list = [];
                for (var i = 0; i < inResponse['results'].length; i++ ) {
                    accessList.push({
                        'organization_id': inResponse['results'][i].organization_id,
                        'name': inResponse['results'][i].name,
                        'short_name': inResponse['results'][i].short_name,
                        'access_type': inResponse['results'][i].access_type
                    });

                    options_list.push({
                        'display_text': inResponse['results'][i].short_name + ' - ' +
                            inResponse['results'][i].access_type + ' access',
                        'value': inResponse['results'][i].organization_id
                    });
                }
                this.set('.organizationAccessList', accessList);
                this.set('.$.organizationSelectPopup.options_list', options_list);
                this.$.organizationSelectPopup.show();
            }
        },

        /**
         * This needs to be separate from the main clearinghouse ajax error handler, so that
         * that clearinghouse can receive the xhrResponse data.
         *
         * @method
         * @private
         * @param inSender
         * @param inResponse
         */
        selectedOrganizationAjaxError: function (inSender, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
            this.doAjaxError(inSender.xhrResponse);
        },

        /**
         * Fires either when an ajax call returns with new organization details (e.g., after the
         * new token is received), or when the 'Set active organization' menu item is selected.
         * The popup in this control is created in the processSelectedOrganizationResponse() method,
         * which is itself called by the selectedOrganizationChanged() method - in short, you get here
         * by setting selectedOrganization to null (with a truthy third argument if you want to force
         * it in the beginning).
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        activeOrganizationChangedHandler: function (inSender, inEvent) {
            this.$.organizationSelectPopup.hide();

            for (var i = 0; i < this.get('.organizationAccessList').length; i++) {
                if (this.organizationAccessList[i].organization_id == inEvent.organization_id) {
                    this.set('.selectedOrganization', {
                        'organization_id': this.organizationAccessList[i].organization_id,
                        'name': this.organizationAccessList[i].name,
                        'short_name': this.organizationAccessList[i].short_name
                    });
                    if (this.organizationAccessList[i].access_type == 'read') {
                        this.set('.currentOrgReadOnly', true);
                        this.set('.currentOrgReadWrite', false);
                        this.set('.currentOrgAdmin', false);
                    }
                    else if (this.organizationAccessList[i].access_type == 'write') {
                        this.set('.currentOrgReadOnly', false);
                        this.set('.currentOrgReadWrite', true);
                        this.set('.currentOrgAdmin', false);
                    }
                    else if (this.organizationAccessList[i].access_type == 'admin') {
                        this.set('.currentOrgReadOnly', false);
                        this.set('.currentOrgReadWrite', false);
                        this.set('.currentOrgAdmin', true);
                    }
                    else {
                        this.set('.currentOrgReadOnly', false);
                        this.set('.currentOrgReadWrite', false);
                        this.set('.currentOrgAdmin', false);
                    }

                    this.set('.$.menuActiveOrg.content', 'Set Active Organization (Currently: <em>' +
                        this.organizationAccessList[i].short_name + '</em>)')
                }
            }

            this.$.organizationSelectPopup.destroy(); // we will only rarely need this popup.
        },

        /**
         * Forces a call to [activeOrganizationChangedHandler()]{@link oarn.PrimaryContainer#activeOrganizationChangedHandler}
         * @method
         * @private
         * @param inSender
         * @param inEvent
         */
        menuActiveOrgSelected: function (inSender, inEvent) {
            this.set('.selectedOrganization', null);
        },

        /**
         * @method
         * @private
         * @param inSender
         * @param inEvent
         */
        menuAboutSelected: function (inSender, inEvent) {
            var msg = 'Version: ' + this.get('.version') + '<br /><br />' +
                '&copy; 2015 <br /> Oregon Association of Relief Nurseries';
            this.$.popupFactory.showInfo('About the OARN Database', msg);
        },

        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        familyDetailsDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.familyDetailsDirty', inEvent.dirty);
            return true;
        },

        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        adultDetailsDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.adultDetailsDirty', inEvent.dirty);
            return true;
        },

        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        childDetailsDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.childDetailsDirty', inEvent.dirty);
            return true;
        },

        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        homeVisitDetailsDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.homeVisitDetailsDirty', inEvent.dirty);
            return true;
        },

        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        contactLogDetailsDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.contactLogDetailsDirty', inEvent.dirty);
            return true;
        },

        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        familyAssessmentDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.familyAssessmentDirty', inEvent.dirty);
            return true;
        },

        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        childAssessmentDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.childAssessmentDirty', inEvent.dirty);
            return true;
        },

        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        riskFactorAssessmentDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.riskFactorAssessmentDirty', inEvent.dirty);
            return true;
        },


        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        asqDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.asqDirty', inEvent.dirty);
            return true;
        },

        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        asqseDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.asqseDirty', inEvent.dirty);
            return true;
        },

        /**
         * Triggers an observer and lands in [dirtyStateChangeObserved()]{@link oarn.PrimaryContainer#dirtyStateChangeObserved}
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        waitlistDirtyStateChangedHandler: function (inSender, inEvent) {
            this.set('.waitlistDirty', inEvent.dirty)
        },

        /**
         * Handles the locking/unlocking of the search controls when a child control is in a dirty state.
         *
         * @private
         * @param inSender
         * @param inEvent
         * @returns {Boolean}
         */
        dirtyStateChangeObserved: function (previous, current, property) {
            if (this.get('.familyDetailsDirty') ||
                this.get('.adultDetailsDirty') ||
                this.get('.childDetailsDirty') ||
                this.get('.homeVisitDetailsDirty') ||
                this.get('.contactLogDetailsDirty') ||
                this.get('.familyAssessmentDirty') ||
                this.get('.childAssessmentDirty') ||
                this.get('.riskFactorAssessmentDirty') ||
                this.get('.asqDirty') ||
                this.get('.asqseDirty') ||
                this.get('.waitlistDirty')
            ) {
                this.$.mainTools.setDirty(true);
                this.$.searchResults.setEnabled(false);
                this.$.foundFamilies.setEnabled(false);
                this.$.foundAdults.setEnabled(false);
                this.$.foundChildren.setEnabled(false);
            }
            else {
                this.$.mainTools.setDirty(false);
                this.$.searchResults.setEnabled(true);
                this.$.foundFamilies.setEnabled(true);
                this.$.foundAdults.setEnabled(true);
                this.$.foundChildren.setEnabled(true);
            }
        },

        /**
         * When a user attempts to select a different person, family. or family member while a child control
         * is in a dirty state, this handler is triggered, popping up a confirmation dialog.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        confirmationNeededHandler: function (inSender, inEvent) {
            var msg = 'You appear to have unsaved changes that will be lost if you close this view. ' +
                'Do you wish to continue anyway?';

            this.lockDetails.control = inEvent.originator.name;
            this.lockDetails.index = inEvent.index;
            this.lockDetails.toolbarSelection = inEvent.toolbarSelection;
            this.$.popupFactory.showConfirm('Unsaved Changes', msg);
        },

        /**
         * We need to wait for a confirmation popup to close before proceeding with
         * the change operation. To do this the popup emits an event on closing that is
         * then handled here. We check that it was a delete confirmation by verifying
         * that 'confirmed' is defined in inEvent.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        popupClosedHandler: function (inSender, inEvent) {

            if ((inEvent.confirmed === undefined) || (inEvent.confirmed === false)) {
                return; // we only want to take action if confirmation has occurred
            }
            else if (inEvent.confirmed) {
                // Reset dirty flags directly to avoid observation by handlers:
                this.familyDetailsDirty = false;
                this.adultDetailsDirty = false;
                this.childDetailsDirty = false;
                this.homeVisitDetailsDirty = false;
                this.contactLogDetailsDirty = false;
                this.familyAssessmentDirty = false;
                this.childAssessmentDirty = false;
                this.riskFactorAssessmentDirty = false;
                this.asqDirty = false;
                this.asqseDirty = false;
                this.waitlistDirty = false;

                // Unlock controls:
                this.$.mainTools.setDirty(false);
                this.$.searchResults.setEnabled(true);
                this.$.foundFamilies.setEnabled(true);
                this.$.foundAdults.setEnabled(true);
                this.$.foundChildren.setEnabled(true);

                // Take the intended action:
                if (this.lockDetails.control == 'mainTools') {
                    this.$.mainTools.select(this.lockDetails.toolbarSelection);
                }
                else if (this.lockDetails.control == 'foundFamilies') {
                    this.$.foundFamilies.setSelected(this.lockDetails.index);
                }
                else if (this.lockDetails.control == 'foundAdults') {
                    this.$.foundAdults.setSelected(this.lockDetails.index);
                }
                else if (this.lockDetails.control == 'foundChildren') {
                    this.$.foundChildren.setSelected(this.lockDetails.index);
                }
                else if (this.lockDetails.control == 'searchResults') {
                    this.$.searchResults.setSelected(this.lockDetails.index);
                }
            }
            return true;
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        menuCreateNewFamilyNewAdultSelected: function (inSender, inEvent) {
            this.createComponent({name: 'newFamilyNewAdultPopup', kind: 'oarn.NewFamilyNewAdult'},
                {owner: this});

            var tokenBinding = new enyo.Binding({
                from: '.token',
                to: '.$.newFamilyNewAdultPopup.token',
                owner: this
            });

            var orgBinding = new enyo.Binding({
                from: '.selectedOrganization',
                to: '.$.newFamilyNewAdultPopup.selectedOrganization',
                owner: this
            });

            this.$.newFamilyNewAdultPopup.show();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnFamilyDetailsClickedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.foundAdults.deselectAll();
            this.$.foundChildren.deselectAll();

            this.$.detailsDrawer.createComponent({name: 'familyDetails', kind: 'oarn.FamilyDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },


        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnEnrollmentClickedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.foundAdults.deselectAll();
            this.$.foundChildren.deselectAll();

            this.$.detailsDrawer.createComponent({name: 'enrollmentDetails', kind: 'oarn.EnrollmentDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnHomeVisitsClickedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.foundAdults.deselectAll();
            this.$.foundChildren.deselectAll();

            this.$.detailsDrawer.createComponent({name: 'homeVisitDetails', kind: 'oarn.HomeVisitDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnContactLogClickedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.foundAdults.deselectAll();
            this.$.foundChildren.deselectAll();

            this.$.detailsDrawer.createComponent({name: 'contactLogDetails', kind: 'oarn.ContactLogDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnAdultDetailsClickedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.foundChildren.deselectAll();
            this.$.detailsDrawer.createComponent({name: 'adultDetails', kind: 'oarn.AdultDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnChildDetailsClickedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.foundAdults.deselectAll();
            this.$.detailsDrawer.createComponent({name: 'childDetails', kind: 'oarn.ChildDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnFamilyAssessmentSelectedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.mainTools.setToolbarState('family-none-selected')
            this.$.foundAdults.deselectAll();
            this.$.foundChildren.deselectAll();

            this.$.detailsDrawer.createComponent({name: 'familyAssessmentDetails', kind: 'oarn.FamilyAssessmentDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnRiskFActorAssessmentSelectedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.mainTools.setToolbarState('family-none-selected');
            this.$.foundAdults.deselectAll();
            this.$.foundChildren.deselectAll();

            this.$.detailsDrawer.createComponent({name: 'riskFactorAssessmentDetails', kind: 'oarn.RiskFactorAssessmentDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnChildAssessmentSelectedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.mainTools.setToolbarState('child-none-selected')
            this.$.foundAdults.deselectAll();

            this.$.detailsDrawer.createComponent({name: 'childAssessmentDetails', kind: 'oarn.ChildAssessmentDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnASQSelectedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.mainTools.setToolbarState('child-none-selected')
            this.$.foundAdults.deselectAll();

            this.$.detailsDrawer.createComponent({name: 'asqDetails', kind: 'oarn.ASQDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        btnASQSESelectedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.mainTools.setToolbarState('child-none-selected')
            this.$.foundAdults.deselectAll();

            this.$.detailsDrawer.createComponent({name: 'asqseDetails', kind: 'oarn.ASQSEDetails'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        createFamily: function (inSender, inEvent)  {
            if (this.get('.currentOrgReadOnly')) {
                this.$.popupFactory.showInfo('Insufficient Privileges',
                    'The currently set organization is read-only for this user. Please ' +
                    'login using a different user account or contact your database administrator for assistance.');
            }
            else {
                this.createComponent({name: 'familyRecordCreator', kind: 'oarn.FamilyRecordCreator'},
                    {owner: this});
                this.$.familyRecordCreator.render();
                this.$.familyRecordCreator.show();

            }
        },

        /**
         * During the creation of a new person record, if a duplicate is found and the user decides to view the
         * record rather than continuing with the creation process, this catches the event.
         *
         * @private
         * @param inSender
         * @param inEvent
         */
        duplicateSelectedHandler: function (inSender, inEvent) {
            this.set('.selectedPersonItem', inEvent.item);
            this.set('.selectedPersonID', inEvent.id);
            this.set('.selectedFamilyID', 0);

            this.$.foundFamilies.deselectAll();
            this.$.foundAdults.deselectAll();
            this.$.foundChildren.deselectAll();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        createChildSelectedHandler: function (inSender, inEvent) {
            if (this.get('.currentOrgReadOnly')) {
                this.$.popupFactory.showInfo('Insufficient Privileges',
                    'The currently set organization is read-only for this user. Please ' +
                    'login using a different user account or contact your database administrator for assistance.');
                return;
            }
            this.createComponent({name: 'childRecordCreator', kind: 'oarn.ChildRecordCreator'},
                {owner: this});
            this.$.childRecordCreator.render();
            this.$.childRecordCreator.show();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        linkChildSelectedHandler: function (inSender, inEvent) {
            if (this.get('.currentOrgReadOnly')) {
                this.$.popupFactory.showInfo('Insufficient Privileges',
                    'The currently set organization is read-only for this user. Please ' +
                    'login using a different user account or contact your database administrator for assistance.');
                return;
            }
            this.createComponent({name: 'childLinkCreator', kind: 'oarn.ChildLinkCreator'},
                {owner: this});
            this.$.childLinkCreator.render();
            this.$.childLinkCreator.show();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        createAdultSelectedHandler: function (inSender, inEvent) {
            if (this.get('.currentOrgReadOnly')) {
                this.$.popupFactory.showInfo('Insufficient Privileges',
                    'The currently set organization is read-only for this user. Please ' +
                    'login using a different user account or contact your database administrator for assistance.');
                return;
            }
            this.createComponent({name: 'adultRecordCreator', kind: 'oarn.AdultRecordCreator'},
                {owner: this});
            this.$.adultRecordCreator.render();
            this.$.adultRecordCreator.show();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        linkAdultSelectedHandler: function (inSender, inEvent) {
            if (this.get('.currentOrgReadOnly')) {
                this.$.popupFactory.showInfo('Insufficient Privileges',
                    'The currently set organization is read-only for this user. Please ' +
                    'login using a different user account or contact your database administrator for assistance.');
                return;
            }
            this.createComponent({name: 'adultLinkCreator', kind: 'oarn.AdultLinkCreator'},
                {owner: this});
            this.$.adultLinkCreator.render();
            this.$.adultLinkCreator.show();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         * @returns {boolean}
         */
        familyOptionPopupClosed: function (inSender, inEvent) {
            if (inEvent.sender == 'ChildRecordCreator') {
                if (this.$.childRecordCreator && this.$.childRecordCreator.hasNode()) {
                    this.$.childRecordCreator.destroy();
                }
                if (inEvent.id > -1) {
                    this.doSelectedPersonChanged({'id':inEvent.id, 'item': inEvent.item});
                }
            }
            else if (inEvent.sender == 'ChildLinkCreator') {
                if (this.$.childLinkCreator && this.$.childLinkCreator.hasNode()) {
                    this.$.childLinkCreator.destroy();
                }
                if (inEvent.id > -1) {
                    this.doSelectedPersonChanged({'id':inEvent.id, 'item': inEvent.item});
                }
            }
            else if (inEvent.sender == 'AdultRecordCreator') {
                if (this.$.adultRecordCreator && this.$.adultRecordCreator.hasNode()) {
                    this.$.adultRecordCreator.destroy();
                }
                if (inEvent.id > -1) {
                    this.doSelectedPersonChanged({'id':inEvent.id, 'item': inEvent.item});
                }
            }
            else if (inEvent.sender == 'AdultLinkCreator') {
                if (this.$.adultLinkCreator && this.$.adultLinkCreator.hasNode()) {
                    this.$.adultLinkCreator.destroy();
                }
                if (inEvent.id > -1) {
                    this.doSelectedPersonChanged({'id':inEvent.id, 'item': inEvent.item});
                }
            }
            else if (inEvent.sender == 'FamilyRecordCreator') {
                if (this.$.familyRecordCreator && this.$.familyRecordCreator.hasNode()) {
                    this.$.familyRecordCreator.destroy();
                }
                if (inEvent.id > -1) {
                    this.doSelectedPersonChanged({'id':inEvent.id, 'item': inEvent.item});
                }
            }

            return true;
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        familySelectedHandler: function (inSender, inEvent) {
            this.set('.selectedFamilyID', inEvent.newVal);
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        waitlistSelectedHandler: function (inSender, inEvent) {
            this.clearDetailsPanelControls();

            this.$.foundAdults.deselectAll();
            this.$.foundChildren.deselectAll();

            this.$.detailsDrawer.createComponent({name: 'waitlist', kind: 'oarn.Waitlist'},
                {owner: this});
            this.$.detailsDrawer.render();
        },

        /**
         * Certain features are not available to non-admins. This is where they should be hidden.
         *
         * @private
         * @param oldVal
         */
        currentOrgAdminChanged: function (oldVal) {
            if (!this.get('.currentOrgAdmin')) {
                this.$.btnManageClassrooms.hide();
                this.$.btnManageUsers.hide();
            } else {
                this.$.btnManageClassrooms.show();
               // this.$.btnManageUsers.show();
            }
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        manageClassrooms: function (inSender, inEvent) {
            this.createComponent({name: 'classroomManager', kind: 'oarn.ClassroomManager'},
                {owner: this});
            this.$.classroomManager.render();
            this.$.classroomManager.show();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        classroomManagerClosedHandler: function (inSender, inEvent) {
            if (this.$.classroomManager && this.$.classroomManager.hasNode()) {
                this.$.classroomManager.destroy();
            }
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        manageUsers: function (inSender, inEvent) {
            this.createComponent({name: 'userManager', kind: 'oarn.UserManager'},
                {owner: this});
            this.$.userManager.render();
            this.$.userManager.show();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        userManagerClosedHandler: function (inSender, inEvent) {
            if (this.$.userManager && this.$.userManager.hasNode()) {
                this.$.userManager.destroy();
            }
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        showAttendance: function (inSender, inEvent) {
            this.createComponent({name: 'attendance', kind: 'oarn.Attendance'},
                {owner: this});
            this.$.attendance.render();
            this.$.attendance.show();
        },

        /**
         * @private
         * @param inSender
         * @param inEvent
         */
        attendanceClosedHandler: function (inSender, inEvent) {
            if (this.$.attendance && this.$.attendance.hasNode()) {
                this.$.attendance.destroy();
            }
        }
    });

}) (enyo, this);
