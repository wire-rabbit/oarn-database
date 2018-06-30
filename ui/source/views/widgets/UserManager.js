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

		name: 'oarn.UserManager',

		kind: 'onyx.Popup',

		autoDismiss: false,

	    modal: true,

	    centered: true,

	    scrim: true,

	    floating: true,

	    style: 'background-color: #EAEAEA; min-width:450px;',

	    published: {
	        /**
	         * The API auth token, bound to the widget by a parent control.
	         *
	         * @type {string}
	         * @default null
	         * @public
	         */
	        token: null,

	        /**
	         * The oarn API object, instantiated in create.
	         *
	         * @type {object}
	         * @public
	         */
	        api: null,

	        /**
	         * An object bound from the parent with properties: organization_id, name, and short_name
	         */
	        selectedOrganization: null

	    },

	    components: [
	    	
	    	{kind: 'onyx.Groupbox', components: [
	    		{kind: 'onyx.GroupboxHeader', name: 'newUsersHeader', 
	    			content: 'Create New User <span style="float:right">&#9660;</span>', allowHtml:true, ontap: 'openNewUsers'},
	    		{kind: 'onyx.Drawer', name: 'newUsersDrawer', open: true, components: [
	    			{tag: 'table', style: 'width: 90%;', classes: 'oarn-control oarn-groupbox-control', components: [
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Username:'}
		    				]},
	    					{tag: 'td', style: 'width: 200px', components: [
	    						{name: 'txtNewUsername', kind: 'enyo.Input', style: 'width: 95%',
									attributes: [{'maxlength': 30}], oninput: 'validateUsername'}
	    					]}
	    				]},
	    				{tag: 'tr', name: 'newUsernameErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'newUsernameErrorText'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Password:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'txtNewPassword', kind: 'enyo.Input', type: 'password', style: 'width: 95%',
									attributes: [{'maxlength': 30}], oninput: 'validatePassword'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Confirm Password:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'txtNewPasswordConfirm', kind: 'enyo.Input', type: 'password', style: 'width: 95%',
									attributes: [{'maxlength': 30}], oninput: 'validatePasswordConfirm'}
	    					]}
	    				]},
	    				{tag: 'tr', name: 'newPasswordErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'newPasswordErrorText', allowHtml: true}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'First Name:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'txtNewFirstName', kind: 'enyo.Input', style: 'width: 95%', 
	    						attributes: [{'maxlength': 30}], oninput: 'validateFirstName'}
	    					]}
	    				]},
	    				{tag: 'tr', name: 'newFirstNameErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'newFirstNameErrorText'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Last Name:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'txtNewLastName', kind: 'enyo.Input', style: 'width: 95%', 
	    						attributes: [{'maxlength': 30}], oninput: 'validateLastName'}
	    					]}
	    				]},
	    				{tag: 'tr', name: 'newLastNameErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'newLastNameErrorText'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Email:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'txtNewEmail', kind: 'enyo.Input', type: 'email', style: 'width: 95%', 
	    						attributes: [{'maxlength': 254}], oninput: 'validateEmail'}
	    					]}
	    				]},
	    				{tag: 'tr', name: 'newEmailErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'newEmailErrorText'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Role:'}
	    					]},
	    					{tag: 'td', components: [
	    						{kind: 'oarn.DataSelect', name: 'selectNewRole'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Privileges:'}
	    					]},
	    					{tag: 'td', components: [
	    						{kind: 'oarn.DataSelect', name: 'selectNewPrivileges'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', style: 'width: 125px;', components: [
	    						{tag: 'label', content: 'User Must Change Password:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'chkNewChangePasssword', kind: 'enyo.Checkbox', checked: true}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', style: 'width: 125px;', components: [
	    						{tag: 'label', content: 'User Is Active:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'chkNewIsActive', kind: 'enyo.Checkbox', checked: true}
	    					]}
	    				]},
	    				/*
						// Avoiding SMTP for the time being while serives are evaluated
	    				{tag: 'tr', components: [
	    					{tag: 'td', style: 'min-width: 200px;', components: [
	    						{tag: 'label', style: 'width: 125px;', content: 'Email Credentials to User:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'chkNewEmailUser', kind: 'enyo.Checkbox', checked: true}
	    					]}
	    				]},*/
	    				{tag: 'tr', components: [
	    					{tag: 'td', style: 'min-width: 200px;', components: [
	    						{tag: 'label', style: 'width: 125px;', content: 'Add User to Staff Dropdowns:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'chkNewAddToDropdowns', kind: 'enyo.Checkbox', checked: true}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', attributes: [{'colspan':2}], components: [
	    						{kind: 'onyx.Button', content: 'Create User Account', onclick: 'goCreate'}
	    					]}
	    				]}
	    			]}
	    		]},
	    	]},

	    	{kind: 'onyx.Groupbox', style: 'margin-top: 20px; margin-bottom: 50px;', components: [
	    		{kind: 'onyx.GroupboxHeader', name: 'existingUsersHeader', 
	    			content: 'Manage Existing Users <span style="float:right">&#9658;</span>', allowHtml: true, ontap: 'openExistingUsers'},
	    		{kind: 'onyx.Drawer', name: 'existingUsersDrawer', open: false, components: [
	    			{tag: 'table', style: 'width: 90%;', classes: 'oarn-control oarn-groupbox-control', components: [
	    				{tag: 'tr', components: [
							{tag: 'td', style: 'width: 250px', components: [
	    						{tag: 'label', content: 'Select User to Modify:'}
	    					]},
	    					{tag: 'td', components: [
	    						{kind: 'oarn.DataSelect', name: 'selectUserList', onchange: 'userChanged'}
	    					]}
	    				]},
    					{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Username:'}
		    				]},
	    					{tag: 'td', style: 'width: 200px', components: [
	    						{name: 'txtModifyUsername', kind: 'enyo.Input', style: 'width: 95%',
									attributes: [{'maxlength': 30}], oninput: 'validateModifyUsername'}
	    					]}
	    				]},
	    				{tag: 'tr', name: 'modifyUsernameErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'modifyUsernameErrorText'}
	    					]}
	    				]},

	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'First Name:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'txtModifyFirstName', kind: 'enyo.Input', style: 'width: 95%', 
	    						attributes: [{'maxlength': 30}], oninput: 'validateModifyFirstName'}
	    					]}
	    				]},
	    				{tag: 'tr', name: 'modifyFirstNameErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'modifyFirstNameErrorText'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Last Name:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'txtModifyLastName', kind: 'enyo.Input', style: 'width: 95%', 
	    						attributes: [{'maxlength': 30}], oninput: 'validateModifyLastName'}
	    					]}
	    				]},
	    				{tag: 'tr', name: 'modifyLastNameErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'modifyLastNameErrorText'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Email:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'txtModifyEmail', kind: 'enyo.Input', type: 'email', style: 'width: 95%', 
	    						attributes: [{'maxlength': 254}], oninput: 'validateModifyEmail'}
	    					]}
	    				]},
	    				{tag: 'tr', name: 'modifyEmailErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'modifyEmailErrorText'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Privileges:'}
	    					]},
	    					{tag: 'td', components: [
	    						{kind: 'oarn.DataSelect', name: 'selectModifyPrivileges'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', style: 'width: 125px;', components: [
	    						{tag: 'label', content: 'User Must Change Password:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'chkModifyChangePasssword', kind: 'enyo.Checkbox', checked: true},
	    						{name: 'readOnlyChkModifyChangePasssword', kind: 'enyo.Checkbox', checked: true, showing: false, 
	    							onchange: 'frozenCheckboxChanged'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', style: 'width: 125px;', components: [
	    						{tag: 'label', content: 'User Is Active:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'chkModifyIsActive', kind: 'enyo.Checkbox', checked: true},
	    						{name: 'readOnlyChkModifyIsActive', kind: 'enyo.Checkbox', checked: true, showing: false,
	    							onchange: 'frozenCheckboxChanged'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
								{tag: 'td', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', allowHtml: true, 
	    							content: '<em>To change user\'s password, please complete the following fields:<em>'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Password:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'txtModifyPassword', kind: 'enyo.Input', type: 'password', style: 'width: 95%',
									attributes: [{'maxlength': 30}], oninput: 'validateModifyPassword'}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', components: [
	    						{tag: 'label', content: 'Confirm Password:'}
	    					]},
	    					{tag: 'td', components: [
	    						{name: 'txtModifyPasswordConfirm', kind: 'enyo.Input', type: 'password', style: 'width: 95%',
									attributes: [{'maxlength': 30}], oninput: 'validateModifyPasswordConfirm'}
	    					]}
	    				]},
	    				{tag: 'tr', name: 'modifyPasswordErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'modifyPasswordErrorText', allowHtml: true}
	    					]}
	    				]},
	    				{tag: 'tr', components: [
	    					{tag: 'td', attributes: [{'colspan':2}], components: [
	    						{kind: 'onyx.Button', content: 'Modify User Account', onclick: 'goModify'}
	    					]}
	    				]}
	    			]}
	    		]}
	    	]},

		    {name: 'buttonsRow', 
		    	style: 'position: absolute; bottom: 10px; left: 50%; -webkit-transform: translate(-50%, 0); moz-transform: translate(-50%, 0); transform: translate(-50%, 0);',
		         components: [{name: 'btnClose', kind: 'onyx.Button', content: 'Close',
		                        style: 'margin: 5px 5px 5px 5px',	ontap: 'goClose'}]},

	        {name: 'popupFactory', kind: 'oarn.PopupFactory'},

	        {name: 'selectHelper', kind: 'oarn.SelectHelper'}
	    ],

	    events: {

	    	onAjaxError: '',

            onAjaxStarted: '',

            onAjaxFinished: '',
	        
			onUserManagerClosed: ''
	    },

	    handlers: {
            onSelectListsAcquired: 'selectListsAcquiredHandler'
        },

	    create: function () {
	    	this.inherited(arguments);

	    	this.api = new oarn.API();

	    	this.$.selectHelper.endpoints.push({
	    		endpoint: 'api/v1/ref/roles/',
                name: 'user_roles', 
                parseWith: this.$.selectHelper.parseGenericRefTable
	    	});

	    	this.set('.api.token', this.get('.token'));
            this.set('.api.method', 'GET');
            var endpoint = 'api/v1/users/?organization_id=' + this.get('.selectedOrganization.organization_id');
            var ajax = this.api.getAjaxObject(endpoint);
            ajax.go();
            ajax.response(enyo.bindSafely(this, 'processGetUserListResponse'));
            ajax.error(enyo.bindSafely(this, 'processGetUserListError'));

	    	this.$.selectHelper.loadSelectData();
	    },

	    rendered: function () {
	    	this.inherited(arguments);

	    	this.$.selectNewPrivileges.options_list.add([
	    		{value: 1, display_text: "Read-Write"},
	    		{value: 2, display_text: "Read-Only"},
	    		{value: 3, display_text: "Admin"}
	    	]);

	    	this.$.selectModifyPrivileges.options_list.add([
	    		{value: 1, display_text: "Read-Write"},
	    		{value: 2, display_text: "Read-Only"},
	    		{value: 3, display_text: "Admin"}
	    	]);

	    	this.$.txtModifyUsername.setDisabled(true);
    		this.$.txtModifyFirstName.setDisabled(true);
    		this.$.txtModifyLastName.setDisabled(true);
    		this.$.txtModifyEmail.setDisabled(true);
    		this.$.txtModifyPassword.setDisabled(true);
    		this.$.txtModifyPasswordConfirm.setDisabled(true);
    		document.getElementById(this.$.selectModifyPrivileges.id).disabled = true;
    		this.$.chkModifyChangePasssword.hide();
    		this.$.readOnlyChkModifyChangePasssword.show();
    		this.$.chkModifyIsActive.hide();
    		this.$.readOnlyChkModifyIsActive.show();
	    },

	    openNewUsers: function(inSender, inEvent) {
	    	this.$.newUsersDrawer.setOpen(!this.$.newUsersDrawer.open);

	    	if (this.$.newUsersDrawer.open) {
	    		this.$.existingUsersDrawer.setOpen(false);
	    		this.$.newUsersHeader.setContent('Create New User <span style="float:right">&#9660;</span>');
	    		this.$.existingUsersHeader.setContent('Manage Existing Users <span style="float:right">&#9658;</span>');
	    	} 
	    	else {
	    		this.$.existingUsersDrawer.setOpen(true);
	    		this.$.newUsersHeader.setContent('Create New User <span style="float:right">&#9658;</span>');
	    		this.$.existingUsersHeader.setContent('Manage Existing Users <span style="float:right">&#9660;</span>');
	    	}
	    },

	    openExistingUsers: function(inSender, inEvent) {
	    	this.$.existingUsersDrawer.setOpen(!this.$.existingUsersDrawer.open);

	    	if (this.$.existingUsersDrawer.open) {
	    		this.$.existingUsersHeader.setContent('Manage Existing Users <span style="float:right">&#9660;</span>');
	    		this.$.newUsersDrawer.setOpen(false);
	    		this.$.newUsersHeader.setContent('Create New User <span style="float:right">&#9658;</span>');
	    	}
	    	else {
	    		this.$.existingUsersHeader.setContent('Manage Existing Users <span style="float:right">&#9658;</span>');
	    		this.$.newUsersDrawer.setOpen(true);
	    		this.$.newUsersHeader.setContent('Create New User <span style="float:right">&#9660;</span>');
	    	}
	    },

	    goClose: function (inSender, inEvent) {
	        this.hide();
	        this.doUserManagerClosed();
	    },

	    goCreate: function (inSender, inEvent) {
	    	if (this.validateUsername() && this.validatePassword() && this.validatePasswordConfirm() &&
	    		this.validateFirstName() && this.validateLastName() && this.validateEmail()) {

	    		// Form fields are valid, we can try to create the new account:
	    		var postBody = {
	    			"selected_organization_id": this.selectedOrganization.organization_id,
	    			"username": this.$.txtNewUsername.getValue(),
	    			"password": this.$.txtNewPassword.getValue(),
	    			"first_name": this.$.txtNewFirstName.getValue(),
	    			"last_name": this.$.txtNewLastName.getValue(),
	    			"email": this.$.txtNewEmail.getValue(),
	    			"role": this.$.selectNewRole.getValue(),
	    			"privileges": this.$.selectNewPrivileges.getValue(),
	    			"user_must_change_password": this.$.chkNewChangePasssword.getValue(),
	    			// "email_credentials": this.$.chkNewEmailUser.getValue(),  // SMTP services are currently under evaluation
	    			"add_to_dropdowns": this.$.chkNewAddToDropdowns.getValue(),
	    			"is_active": this.$.chkNewIsActive.getValue()
	    		};

	    		this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'POST');
                var endpoint = 'api/v1/users/';
                var ajax = this.api.getAjaxObject(endpoint);
                ajax.postBody = postBody;
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'processNewUserResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));


	    	} else {
	    		// Form fields are invalid and the errors have been displayed in the validation routines.
	    		return false;
	    	}
	    },

	    processError: function (inSender, inResponse) {
            this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

            var status = inSender.xhrResponse.status;
            var detail = JSON.parse(inSender.xhrResponse.body);

            var detail_msg = '';
			for (var prop in detail) {
				if (detail.hasOwnProperty(prop)) {
					detail_msg = prop + ': ' + detail[prop] + '<br>'; 
				}
			}

			if (detail_msg.indexOf(":") > -1) {
				detail_msg = detail_msg.split(":")[1]; // strip out "non_field_errors:" from error
			}

			this.$.popupFactory.showInfo('Error Creating User', 'A problem occurred while trying to ' +
				' complete this action: ' +
				'<br><br>' + detail_msg);

            this.set('.xhrResponse', inSender.xhrResponse);
            return true;
        },

	    processNewUserResponse: function (inRequest, inResponse) {
       		this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
			this.$.popupFactory.showInfo("Success","New user account created.");
        },

	    usernameIsValid: function (username) {
	    	var re = new RegExp("^[a-zA-Z0-9@\-_+.]+$");
	    	return re.test(username);
	    },

	    passwordIsValid: function (username, password) {
	    	var re = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()<>[\]{}:;"'<>,.?/~`\-_+=]).{8,30}$/;

	    	if (password.toLowerCase().indexOf(username.toLowerCase()) != -1) {
	    		return false;
	    	}
	    	else {
	    		return re.test(password);
	    	}
	    },

	    passwordConfirmIsValid: function (password, passwordConfirm) {
	    	if (password == passwordConfirm) {
	    		return true;
	    	}
	  		else {
	  			return false;
	  		}
	    },

	    emailIsValid: function (email) {
	    	var re = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	    	return re.test(email);
	    },

	    validateUsername: function (inSender, inEvent) {
	    	if (this.usernameIsValid(this.$.txtNewUsername.getValue())) {
	    		this.$.newUsernameErrorRow.setShowing(false);
	    		return true;
	    	}
	    	else {
	    		this.$.newUsernameErrorText.setContent('Username must be 30 or fewer letters, numbers, or @ - _ . +');
	    		this.$.newUsernameErrorRow.setShowing(true);
	    		return false;
	    	}
	    },

	    validatePassword: function (inSender, inEvent) {

	    	var password = this.$.txtNewPassword.getValue();
	    	var username = this.$.txtNewUsername.getValue();

	    	if (this.passwordIsValid(username, password)) {
	    		this.$.newPasswordErrorText.setContent('');
	    		this.$.newPasswordErrorRow.setShowing(false);
	    		return true;
	    	}
	    	else {
		    	if (password.length == 0) {
		    		this.$.newPasswordErrorText.setContent('Password is required');
		    	}
		    	else if (password.toLowerCase().indexOf(username.toLowerCase()) != -1) {
		    		this.$.newPasswordErrorText.setContent('Password cannot contain username');
		    	}
		    	else {
		    		var msg = 'Password must be 8-30 characters long with a mix of <br> upper and lower case letters, numbers, and symbols';
		    		this.$.newPasswordErrorText.setContent(msg);
		    	}

		    	this.$.newPasswordErrorRow.setShowing(true);
		    	return false;
	    	}
	    },

	    validatePasswordConfirm: function (inSender, inEvent) {
	    	var password = this.$.txtNewPassword.getValue();
	    	var passwordConfirm = this.$.txtNewPasswordConfirm.getValue();

	    	if (!this.passwordConfirmIsValid(password, passwordConfirm)) {
	    		if (this.$.newPasswordErrorRow.getShowing()) {
	    			var msg = '<br>Passwords do not match';
	    			if (this.$.newPasswordErrorText.getContent().indexOf('Passwords do not match') == -1) {
	    				var new_msg = this.$.newPasswordErrorText.getContent() + msg;
	    				this.$.newPasswordErrorText.setContent(new_msg);
	    			}
	    		} else {
	    			var msg = 'Passwords do not match';
	    			this.$.newPasswordErrorRow.setShowing(true);
	    			this.$.newPasswordErrorText.setContent(msg);
	    		}
	    		return false;
	    	}
	    	else {
	    		if (this.$.newPasswordErrorRow.getShowing()) {
	    			this.validatePassword();
	    		}
	    		return true;
	    	}
	    },

	    validateFirstName: function (inSender, inEvent) {
	    	if (this.$.txtNewFirstName.getValue().length == 0) {
	    		this.$.newFirstNameErrorRow.setShowing(true);
	    		this.$.newFirstNameErrorText.setContent('First name cannot be empty');
	    		return false;
	    	}
	    	else {
	    		this.$.newFirstNameErrorRow.setShowing(false);
	    		return true;
	    	}
	    },

	    validateLastName: function (inSender, inEvent) {
	    	if (this.$.txtNewLastName.getValue().length == 0) {
	    		this.$.newLastNameErrorRow.setShowing(true);
	    		this.$.newLastNameErrorText.setContent('Last name cannot be empty');
	    		return false;
	    	} 
	    	else {
	    		this.$.newLastNameErrorRow.setShowing(false);
	    		return true;
	    	}
	    },

	    validateEmail: function (inSender, inEvent) {
	    	if (!this.emailIsValid(this.$.txtNewEmail.getValue())) {
	    		this.$.newEmailErrorRow.setShowing(true);
	    		if (this.$.txtNewEmail.getValue().length > 0) {
	    			this.$.newEmailErrorText.setContent('The email does not appear to be valid');
	    		}
	    		else {
	    			this.$.newEmailErrorText.setContent('Email is required');
	    		}
	    		return false;
	    	}
	    	else {
	    		this.$.newEmailErrorRow.setShowing(false)
	    		return true;
	    	}
	    },

	    selectListsAcquiredHandler: function(inSender, inEvent) {

	    	// We need to remove the 'Client' option.
	    	var trimmed_list = [];
	    	for (var i = 0; i < this.$.selectHelper.optionsLists['user_roles_options_list'].length; i++) {
	    		if (this.$.selectHelper.optionsLists['user_roles_options_list'][i].display_text != 'Client') {
	    			trimmed_list.push(this.$.selectHelper.optionsLists['user_roles_options_list'][i]);
	    		}
	    	}

	    	this.$.selectNewRole.options_list.empty();
	    	this.$.selectNewRole.options_list.add(trimmed_list);
	    },

	    processGetUserListResponse: function (inRequest, inResponse) {
	    	var list = [];
	    	this.user_list = [];

	    	for (var i = 0; i < inResponse.length; i++) {
	    		list.push({value: inResponse[i]['id'], display_text: inResponse[i]['username']});
	    		this.user_list.push({
	    			id: inResponse[i]['id'],
	    			username: inResponse[i]['username'],
	    			first_name: inResponse[i]['first_name'],
	    			last_name: inResponse[i]['last_name'],
	    			email: inResponse[i]['email'],
	    			role: inResponse[i]['role'],
	    			is_active: inResponse[i]['is_active']
	    		});
	    	}

	    	list.unshift({value: -1, display_text: 'Select User'});
	    	
	    	this.$.selectUserList.options_list.empty();
	    	this.$.selectUserList.options_list.add(list);

	    },

	    processGetUserListError: function (inSender, inResponse) {
	    	var status = inSender.xhrResponse.status;
            var detail = JSON.parse(inSender.xhrResponse.body);

            var detail_msg = '';
			for (var prop in detail) {
				if (detail.hasOwnProperty(prop)) {
					detail_msg = prop + ': ' + detail[prop] + '<br>'; 
				}
			}

			if (detail_msg.indexOf(":") > -1) {
				detail_msg = detail_msg.split(":")[1]; // strip out "non_field_errors:" from error
			}

			this.$.popupFactory.showInfo('Error Getting User List', 'A problem occurred while trying to communicate with the server:' +
				'<br><br>' + detail_msg);

            this.set('.xhrResponse', inSender.xhrResponse);
            return true;
	    },
        
	    userChanged: function (inSender, inEvent) {
	    	var id = this.$.selectUserList.getValue();
	    	this.selectedUserID = id;
	    	if (id > 0) {
	    		this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'GET');
                var endpoint = 'api/v1/users/' + id +'/';
                var ajax = this.api.getAjaxObject(endpoint);
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'processGetUserResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));
	    	} else {
	    		this.selectedUserID = -1;
	    		this.$.txtModifyUsername.setValue('');
	    		this.$.txtModifyFirstName.setValue('');
	    		this.$.txtModifyLastName.setValue('');
	    		this.$.txtModifyEmail.setValue('');
	    		this.$.selectModifyPrivileges.setSelected(1);
	    		this.$.chkModifyChangePasssword.setValue(true);
	    		this.$.chkModifyIsActive.setValue(true);

	    		this.$.txtModifyUsername.setDisabled(true);
	    		this.$.txtModifyFirstName.setDisabled(true);
	    		this.$.txtModifyLastName.setDisabled(true);
	    		this.$.txtModifyEmail.setDisabled(true);
	    		this.$.txtModifyPassword.setDisabled(true);
	    		this.$.txtModifyPasswordConfirm.setDisabled(true);
	    		document.getElementById(this.$.selectModifyPrivileges.id).disabled = true;
	    		this.$.chkModifyChangePasssword.hide();
	    		this.$.readOnlyChkModifyChangePasssword.show();
	    		this.$.chkModifyIsActive.hide();
	    		this.$.readOnlyChkModifyIsActive.show();

	    		this.$.modifyUsernameErrorRow.hide();
				this.$.modifyPasswordErrorRow.hide();
				this.$.modifyFirstNameErrorRow.hide();
				this.$.modifyLastNameErrorRow.hide();
				this.$.modifyEmailErrorRow.hide();

	    	}
	    },

	    processGetUserResponse: function (inRequest, inResponse) {

	    	// Hide error rows:
	    	this.$.modifyUsernameErrorRow.hide();
			this.$.modifyPasswordErrorRow.hide();
			this.$.modifyFirstNameErrorRow.hide();
			this.$.modifyLastNameErrorRow.hide();
			this.$.modifyEmailErrorRow.hide();

	    	// Enable controls:
	    	this.$.txtModifyUsername.setValue('');
    		this.$.txtModifyFirstName.setValue('');
    		this.$.txtModifyLastName.setValue('');
    		this.$.txtModifyEmail.setValue('');
    		this.$.selectModifyPrivileges.setSelected(1);
    		this.$.chkModifyChangePasssword.setValue(true);
    		this.$.chkModifyIsActive.setValue(true);

    		this.$.txtModifyUsername.setDisabled(false);
    		this.$.txtModifyFirstName.setDisabled(false);
    		this.$.txtModifyLastName.setDisabled(false);
    		this.$.txtModifyEmail.setDisabled(false);
    		this.$.txtModifyPassword.setDisabled(false);
    		this.$.txtModifyPasswordConfirm.setDisabled(false);
    		document.getElementById(this.$.selectModifyPrivileges.id).disabled = false;
    		this.$.chkModifyChangePasssword.show();
    		this.$.readOnlyChkModifyChangePasssword.hide();
    		this.$.chkModifyIsActive.show();
    		this.$.readOnlyChkModifyIsActive.hide();

	    	// Set new values:    	
	    	this.$.txtModifyUsername.setValue(inResponse['username']);
	    	this.$.txtModifyFirstName.setValue(inResponse['first_name']);
	    	this.$.txtModifyLastName.setValue(inResponse['last_name']);
	    	this.$.txtModifyEmail.setValue(inResponse['email']);
	    	
	    	switch (inResponse['privileges']) {
	    		case 1:
	    			this.$.selectModifyPrivileges.setSelected(0);
	    			break;
	    		case 2:
	    			this.$.selectModifyPrivileges.setSelected(1);
	    			break;
	    		case 3:
	    			this.$.selectModifyPrivileges.setSelected(2);
	    			break;
	    		default:
	    			this.$.selectModifyPrivileges.setSelected(-1);
	    	}
	    	this.$.chkModifyIsActive.setValue(inResponse['is_active']);


	    },

	    goModify: function (inSender, inEvent) {
	    	if (this.validateModifyUsername() && this.validateModifyPassword() && this.validateModifyPasswordConfirm() &&
	    		this.validateModifyFirstName() && this.validateModifyLastName() && this.validateModifyEmail()) {

	    		// Form fields are valid, we can try to create the new account:
	    		var postBody = {
	    			"selected_organization_id": this.selectedOrganization.organization_id,
	    			"username": this.$.txtModifyUsername.getValue(),
	    			"password": this.$.txtModifyPassword.getValue(),
	    			"first_name": this.$.txtModifyFirstName.getValue(),
	    			"last_name": this.$.txtModifyLastName.getValue(),
	    			"email": this.$.txtModifyEmail.getValue(),
	    			"privileges": this.$.selectModifyPrivileges.getValue(),
	    			"user_must_change_password": this.$.chkModifyChangePasssword.getValue(),
	    			"is_active": this.$.chkModifyIsActive.getValue()
	    		};

	    		this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'PATCH');
                var endpoint = 'api/v1/users/' + this.selectedUserID + '/';
                var ajax = this.api.getAjaxObject(endpoint);
                ajax.postBody = postBody;
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'processModifyUserResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));


	    	} else {
	    		// Form fields are invalid and the errors have been displayed in the validation routines.
	    		return false;
	    	}
	    },

	    processModifyUserResponse: function (inRequest, inResponse) {
       		this.doAjaxFinished(); // let a parent control turn off a spinner, etc.
			this.$.popupFactory.showInfo("Success","User account modified.");
        },

	    frozenCheckboxChanged: function (inSender, inEvent) {
			inSender.setChecked(
				!inSender.getChecked()
			);
		},

		validateModifyUsername: function (inSender, inEvent) {
	    	if (this.usernameIsValid(this.$.txtModifyUsername.getValue())) {
	    		this.$.modifyUsernameErrorRow.setShowing(false);
	    		return true;
	    	}
	    	else {
	    		this.$.modifyUsernameErrorText.setContent('Username must be 30 or fewer letters, numbers, or @ - _ . +');
	    		this.$.modifyUsernameErrorRow.setShowing(true);
	    		return false;
	    	}
	    },

	    validateModifyFirstName: function (inSender, inEvent) {
	    	if (this.$.txtModifyFirstName.getValue().length == 0) {
	    		this.$.modifyFirstNameErrorRow.setShowing(true);
	    		this.$.modifyFirstNameErrorText.setContent('First name cannot be empty');
	    		return false;
	    	}
	    	else {
	    		this.$.modifyFirstNameErrorRow.setShowing(false);
	    		return true;
	    	}
	    },

	    validateModifyLastName: function (inSender, inEvent) {
	    	if (this.$.txtModifyLastName.getValue().length == 0) {
	    		this.$.modifyLastNameErrorRow.setShowing(true);
	    		this.$.modifyLastNameErrorText.setContent('Last name cannot be empty');
	    		return false;
	    	}
	    	else {
	    		this.$.modifyLastNameErrorRow.setShowing(false);
	    		return true;
	    	}
	    },

	    validateModifyEmail: function (inSender, inEvent) {
	    	if (!this.emailIsValid(this.$.txtModifyEmail.getValue())) {
	    		this.$.modifyEmailErrorRow.setShowing(true);
	    		if (this.$.txtModifyEmail.getValue().length > 0) {
	    			this.$.modifyEmailErrorText.setContent('The email does not appear to be valid');
	    		}
	    		else {
	    			this.$.modifyEmailErrorText.setContent('Email is required');
	    		}
	    		return false;
	    	}
	    	else {
	    		this.$.modifyEmailErrorRow.setShowing(false)
	    		return true;
	    	}
	    },

	    validateModifyPassword: function (inSender, inEvent) {

	    	var password = this.$.txtModifyPassword.getValue();
	    	var username = this.$.txtModifyUsername.getValue();

	    	if (this.passwordIsValid(username, password)) {
	    		this.$.modifyPasswordErrorText.setContent('');
	    		this.$.modifyPasswordErrorRow.setShowing(false);
	    		return true;
	    	}
	    	else {
		    	if (password.toLowerCase().indexOf(username.toLowerCase()) != -1) {
		    		this.$.modifyPasswordErrorText.setContent('Password cannot contain username');
		    		this.$.modifyPasswordErrorRow.setShowing(true);
		    		return false;
		    	}
		    	else if (password.length == 0) {
		    		this.$.modifyPasswordErrorText.setContent('');
		    		this.$.txtModifyPasswordConfirm.setValue('');
	    			this.$.modifyPasswordErrorRow.setShowing(false);
	    			return true;
		    	}
		    	else {
		    		var msg = 'Password must be 8-30 characters long with a mix of <br> upper and lower case letters, numbers, and symbols';
		    		this.$.modifyPasswordErrorRow.setShowing(true);
		    		this.$.modifyPasswordErrorText.setContent(msg);
		    		return false;
		    	}
	    	}
	    },

	    validateModifyPasswordConfirm: function (inSender, inEvent) {
	    	var password = this.$.txtModifyPassword.getValue();
	    	var passwordConfirm = this.$.txtModifyPasswordConfirm.getValue();

	    	if (!this.passwordConfirmIsValid(password, passwordConfirm)) {
	    		if (this.$.modifyPasswordErrorRow.getShowing()) {
	    			var msg = '<br>Passwords do not match';
	    			if (this.$.modifyPasswordErrorText.getContent().indexOf('Passwords do not match') == -1) {
	    				var new_msg = this.$.modifyPasswordErrorText.getContent() + msg;
	    				this.$.modifyPasswordErrorText.setContent(new_msg);
	    			}
	    		} else {
	    			var msg = 'Passwords do not match';
	    			this.$.modifyPasswordErrorRow.setShowing(true);
	    			this.$.modifyPasswordErrorText.setContent(msg);
	    		}
	    		return false;
	    	}
	    	else {
	    		if (this.$.modifyPasswordErrorRow.getShowing()) {
	    			this.validateModifyPassword(password);
	    		}
	    		return true;
	    	}
	    },
	});
	
}) (enyo, this);
