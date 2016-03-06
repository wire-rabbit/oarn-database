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

from oarndb.models import Organization, OrganizationLocation, Person

from oarndb.serializers import NestedOrganizationPersonRoleSerializer


class OrganizationListSerializer(serializers.Serializer):

    organization_id = serializers.IntegerField()

    def validate_organization_id(self, value):
        try:
            org = Organization.objects.get(pk=value)
        except Organization.DoesNotExist:
            raise ValidationError(detail="Organization does not exist")
        return value


class StaffListSerializer(serializers.ModelSerializer):
    """
    A read-only list of staff
    """
    organization = NestedOrganizationPersonRoleSerializer(source='organizationpersonrole_set', many=True)

    class Meta:
        model = Person

        fields = (
            'person_id',
            'first_name',
            'last_name',
            'organization'
        )

class OrganizationLocationSerializer(serializers.ModelSerializer):
    """
    A list of organizational sites
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = OrganizationLocation

        fields = (
            'organization_location_id',
            'organization',
            'name',
            'short_name',
            'street_number_and_name',
            'apartment_room_or_suite_number',
            'city',
            'ref_state',
            'postal_code',
            'ref_county',
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
            if Organization.objects.get_admin_orgs(request.user).filter(
                    organization_id=obj.organization.organization_id).count() > 0:
                return False
            else:
                return True
        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have admin rights to the supplied organization?
            org = validated_data.get('organization', None)
            if org:
                if Organization.objects.get_admin_orgs(request.user).filter(
                        organization_id=org.organization_id).count() == 0:
                    raise PermissionDenied(detail="Admin rights to this organization are required.")
            else:
                raise ValidationError(detail="No organization supplied")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(OrganizationLocationSerializer, self).create(validated_data)
        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have admin rights to the instance organization?
            if Organization.objects.get_admin_orgs(request.user).filter(
                        organization_id=instance.organization.organization_id).count() == 0:
                    raise PermissionDenied(detail="Admin rights to the instance organization are required.")

            # Does the user have admin rights to the supplied organization?
            org = validated_data.get('organization', None)
            if org:
                if Organization.objects.get_admin_orgs(request.user).filter(
                        organization_id=org.organization_id).count() == 0:
                    raise PermissionDenied(detail="Admin rights to this organization are required.")
            else:
                raise ValidationError(detail="No organization supplied")

            # If we've made it here, we can update the record:
            validated_data['modified_by'] = request.user
            return super(OrganizationLocationSerializer, self).update(instance, validated_data)
        else:
            raise ValidationError(detail="No request context provided")