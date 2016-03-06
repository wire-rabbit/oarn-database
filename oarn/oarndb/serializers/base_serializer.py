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

from rest_framework import serializers, status
from rest_framework.exceptions import PermissionDenied, ValidationError

from oarndb.models import Organization


class BaseSerializer(serializers.ModelSerializer):
    """
    A generic ModelSerializer that handles security checks in 
    its update and create methods.
    """
    read_only = serializers.SerializerMethodField('is_read_only')

    def update(self, instance, validated_data):
        """
        Does the user have write access to the instance? Does the validated data
        include any references that the user does not have read access to?
        """
        request = self.context.get('request', None)

        if request is not None:
            error_msg = "User has insufficient rights for this update operation."
            user = request.user

            # First verify that the user has write access for what's included in the
            # validated_data and that there are no errors in the validated_data:
            validated_data_access = self.Meta.model.get_validated_data_access(request.user, validated_data)
            if validated_data_access['error']:
                if validated_data_access['status_code'] == status.HTTP_400_BAD_REQUEST:
                    raise ValidationError(detail=validated_data_access['error_msg'])
                else:
                    raise PermissionDenied(detail=validated_data_access['error_msg'])
            elif not validated_data_access['write']:
                raise PermissionDenied(detail=error_msg)

            # Next, verify that the user has write access to the instance being updated:
            user_access = instance.get_instance_access(request.user)
            if user_access['write']:
                instance.modified_by = user
                return super(BaseSerializer, self).update(instance, validated_data)
            else:
                raise PermissionDenied(detail=error_msg)
        else:
            raise ValidationError(detail="No request context provided.")

    def create(self, validated_data):
        """
        Does the user have the necessary rights to the proposed new record?
        Are there other validation errors?
        """
        request = self.context.get('request', None)

        proceed_with_create = False  # must be True after what follows for the update to occur
        error_msg = "User has insufficient rights for this create operation."

        if request is not None:
            validated_data_access = self.Meta.model.get_validated_data_access(request.user, validated_data)
            if validated_data_access['error']:
                if validated_data_access['status_code'] == status.HTTP_400_BAD_REQUEST:
                    raise ValidationError(detail=validated_data_access['error_msg'])
                else:
                    raise PermissionDenied(detail=validated_data_access['error_msg'])
            elif not validated_data_access['write']:
                raise PermissionDenied(detail=error_msg)
            else:
                validated_data['created_by'] = request.user
                return super(BaseSerializer, self).create(validated_data)

        else:  # request is None
            error_msg = "No request context was provided."
            raise ValidationError(detail=error_msg)

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)
        error_msg = "User has insufficient rights for this update operation."

        if request is not None:
            user_access = obj.get_instance_access(request.user)
            return not user_access['write']

        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")