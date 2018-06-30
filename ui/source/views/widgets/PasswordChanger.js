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

		name: 'oarn.PasswordChanger',

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
	        selectedOrganization: null,

	        /**
			 *  A string bound from the parent with the current user's username
	         */
	        username: '',

	        /**
	         *  When the password change is mandatory, setting this to true changes the behavior of the control
	         */
	        mandatory: false

	    },

	    events: {

	    	onAjaxError: '',

            onAjaxStarted: '',

            onAjaxFinished: '',
	        
			onPasswordChangerClosed: '',

			onLogout: ''

	    },

	    handlers: {
	    	onPopupClosed: 'popupClosedHandler'
	    },

	    components: [
			{kind: 'onyx.Groupbox', components: [
	    		{kind: 'onyx.GroupboxHeader', content: 'Change Password'},

	    		{components: [
					{tag: 'table', style: 'width: 95%; display: table;', classes: 'oarn-control oarn-groupbox-control', components: [
						
						{tag: 'tr', name: 'mandatoryTextRow', components: [
							{tag: 'td', style: 'text-align: center; padding-bottom: 15px;', attributes: [{'colspan':'2'}], components: [
								{content: 'A password change is required before continuing.'}
							]}
						]},
						{tag: 'tr', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'Current Password:'}
							]},
							{tag: 'td', components: [
								{name: 'txtCurrentPassword', kind: 'enyo.Input', type: 'password', style: 'width: 95%',
									attributes: [{'maxlength': 30}]}
							]}
		    			]},
		    			{tag: 'tr', name: 'currentPasswordErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'currentPasswordErrorText', allowHtml: true}
	    					]}
	    				]},
		    			{tag: 'tr', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'New Password:'}
							]},
							{tag: 'td', components: [
								{name: 'txtNewPassword', kind: 'enyo.Input', type: 'password', style: 'width: 95%',
									attributes: [{'maxlength': 30}], oninput: 'validatePassword'}
							]}
		    			]},
		    			{tag: 'tr', name: 'newPasswordErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'newPasswordErrorText', allowHtml: true}
	    					]}
	    				]},
		    			{tag: 'tr', components: [
							{tag: 'td', components: [
								{tag: 'label', content: 'Confirm New Password:'}
							]},
							{tag: 'td', components: [
								{name: 'txtConfirmNewPassword', kind: 'enyo.Input', type: 'password', style: 'width: 95%',
									attributes: [{'maxlength': 30}], oninput: 'validatePasswordConfirm'}
							]}
		    			]},
		    			{tag: 'tr', name: 'confirmPasswordErrorRow', showing: false, components: [
	    					{tag: 'td', classes: 'oarn-error-row', attributes: [{'colspan':'2'}], components: [
	    						{tag: 'span', name: 'confirmPasswordErrorText', allowHtml: true}
	    					]}
	    				]},

						{tag: 'tr', components: [
		    				{tag: 'td', attributes: [{'colspan': '2'}], style: 'padding-top: 10px; text-align: center', components: [
		    					{name: 'btnConfirm', style: 'margin: 5px; display: inline-block;', kind: 'onyx.Button', content: 'Confirm Change', ontap: 'goConfirm'},
		    					{name: 'btnCancel', kind: 'onyx.Button', content: 'Cancel', style: 'margin: 5px; display: inline-block;', ontap: 'goCancel'}
		    				]}
		    			]},
						
	    			]}

	    		]}

	    		
			]},

	        {name: 'popupFactory', kind: 'oarn.PopupFactory'},
	        {name: 'successPopupFactory', kind: 'oarn.PopupFactory'},

	        {name: 'selectHelper', kind: 'oarn.SelectHelper'}
	    ],

	    create: function (inSender, inEvent) {
	    	this.inherited(arguments);
	    	this.api = new oarn.API();
	    },

	    passwordIsValid: function () {
	    	var re = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()<>[\]{}:;"'<>,.?/~`\-_+=]).{8,30}$/;
	    	var password = this.$.txtNewPassword.getValue();
	    	var username = this.get('.username');
	    	var currentPassword = this.$.txtCurrentPassword.getValue();

	    	if (password.toLowerCase().indexOf(username.toLowerCase()) != -1) {
	    		return false;
	    	}
	    	else if (password.toLowerCase().indexOf(currentPassword) != -1) {
	    		return false;
	    	}
	    	else {
	    		return re.test(password);
	    	}
	    },

	    passwordConfirmIsValid: function () {
	    	var password = this.$.txtNewPassword.getValue();
	    	var passwordConfirm = this.$.txtConfirmNewPassword.getValue();
	    	if (password == passwordConfirm) {
	    		return true;
	    	}
	  		else {
	  			return false;
	  		}
	    },

	    validatePassword: function (inSender, inEvent) {
	    	if (this.passwordIsValid()) {
	    		this.$.newPasswordErrorText.setContent('');
	    		this.$.newPasswordErrorRow.setShowing(false);
	    		return true;
	    	}
	    	else {
	    		var password = this.$.txtNewPassword.getValue();
		    	var username = this.get('.username');

		    	if (password.length == 0) {
		    		this.$.newPasswordErrorText.setContent('Password is required');
		    	}
		    	else if (password.toLowerCase().indexOf(username.toLowerCase()) != -1) {
		    		this.$.newPasswordErrorText.setContent('Password cannot contain username');
		    	}
		    	else if (password.toLowerCase().indexOf(this.$.txtCurrentPassword.getValue()) != -1) {
		    		this.$.newPasswordErrorText.setContent('The new password cannot contain the old password');
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
	    	if (!this.passwordConfirmIsValid()) {
	    		this.$.confirmPasswordErrorText.setContent('Passwords do not match');
	    		this.$.confirmPasswordErrorRow.setShowing(true);
	    	}
	    	else {
	    		this.$.confirmPasswordErrorRow.setShowing(false);
	    		return true;
	    	}
	    },

	    goCancel: function (inSender, inEvent) {
	        this.hide();
	        this.doPasswordChangerClosed();
	    },

	    goConfirm: function (inSender, inEvent) {
	    	if (this.validatePassword() && this.validatePasswordConfirm()) {
	    		// Form fields are valid, we can try to create the new account:
	    		var postBody = {
	    			"current_password": this.$.txtCurrentPassword.getValue(),
	    			"new_password": this.$.txtNewPassword.getValue()
	    		};

	    		this.set('.api.token', this.get('.token'));
                this.set('.api.method', 'PATCH');
                var endpoint = 'api/v1/users/me';
                var ajax = this.api.getAjaxObject(endpoint);
                ajax.postBody = postBody;
                ajax.go();
                ajax.response(enyo.bindSafely(this, 'processResponse'));
                ajax.error(enyo.bindSafely(this, 'processError'));
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

			this.$.popupFactory.showInfo('Error Changing Password', 'A problem occurred while trying to ' +
				' change your password: ' +
				'<br><br>' + detail_msg);

            this.set('.xhrResponse', inSender.xhrResponse);
            return true;
        },

        /**
		 * Handles the Ajax response on success.
		 *
		 * @param inRequest
		 * @param inResponse
		 * @private
		 */
		processResponse: function (inRequest, inResponse) {
			this.doAjaxFinished(); // let a parent control turn off a spinner, etc.

			this.$.successPopupFactory.showInfo("Success","Password changed. Please log in again.");
		},

		popupClosedHandler: function (inSender, inEvent) {
			if (inEvent.originator.name == 'successPopupFactory') {
	        	this.hide();
				this.doLogout();
				this.doPasswordChangerClosed();
			}
		},

		mandatoryChanged: function (oldVal, newVal) {
			this.$.mandatoryTextRow.setShowing(newVal);
			this.$.btnCancel.setShowing(!newVal);
		}

	});

}) (enyo, this);