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

from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError

from oarndb.models import Waitlist, Organization, Person


class WaitlistSerializer(serializers.ModelSerializer):
    """
    Describes the status of a family awaiting services.
    """
    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = Waitlist

        fields = (
            'waitlist_id',
            'open_date',
            'close_date',
            'family',
            'assigned_to_employee',
            'assigned_date',
            'ref_referred_from',
            'ref_waitlist_status',
            'child_under_three',
            'child_under_five',
            'open_child_welfare_case',
            'mother_is_pregnant',
            'service_need_1',
            'service_need_2',
            'service_need_3',
            'service_need_4',
            'service_need_5',
            'service_need_6',
            'notes',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        """
        request = self.context.get('request', None)

        if request is not None:
            if obj.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                return True
            else:
                return False
        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        """
        Creates a new waitlist record. The user must have write access to the family and read
        access to the referral source, waitlist status, and assigned employee.
        """

        request = self.context.get('request', None)
        if request:
            # Does the user have write access to this family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # Does the user have read access permissions for the assigned employee?
            person = validated_data.get('assigned_to_employee')
            if person:
                if person.organization.filter(
                        organization_id__in=Organization.objects.get_read_orgs(request.user)
                ).count() == 0:
                    error_msg = "Read permissions are required for the assigned employee record."
                    raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied waitlist status?
            ref_waitlist_status = validated_data.get('ref_waitlist_status', None)
            if ref_waitlist_status:
                if not ref_waitlist_status.universal:
                    if ref_waitlist_status.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected waitlist status."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied referral source?
            ref_referred_from = validated_data.get('ref_referred_from', None)
            if ref_referred_from:
                if not ref_referred_from.universal:
                    if ref_referred_from.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected waitlist status."
                        raise PermissionDenied(detail=error_msg)

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(WaitlistSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        """
        Updates a given Waitlist record.
        """
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the family referenced in the given instance?
            if instance.family.organizations.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() == 0:
                    error_msg = "Write permissions are required for the family record " \
                                "referenced by the existing instance."
                    raise PermissionDenied(detail=error_msg)

            # Does the user have write access to the supplied family?
            family = validated_data.get('family', None)
            if family:
                if family.organizations.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this family record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No family was supplied.")

            # Does the user have read access permissions for the assigned employee?
            person = validated_data.get('assigned_to_employee')
            if person:
                if person.organization.filter(
                        organization_id__in=Organization.objects.get_read_orgs(request.user)
                ).count() == 0:
                    error_msg = "Read permissions are required for the assigned employee record."
                    raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied waitlist status?
            ref_waitlist_status = validated_data.get('ref_waitlist_status', None)
            if ref_waitlist_status:
                if not ref_waitlist_status.universal:
                    if ref_waitlist_status.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected waitlist status."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied referral source?
            ref_referred_from = validated_data.get('ref_referred_from', None)
            if ref_referred_from:
                if not ref_referred_from.universal:
                    if ref_referred_from.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected waitlist status."
                        raise PermissionDenied(detail=error_msg)

            # If we've made it here, we can update the record:
            validated_data['modified_by'] = request.user
            return super(WaitlistSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")