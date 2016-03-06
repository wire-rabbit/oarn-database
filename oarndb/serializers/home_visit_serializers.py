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

from oarndb.models import HomeVisit, RefHomeVisitLocation, Organization, ContactLog, RefContactType


class HomeVisitSerializer(serializers.ModelSerializer):
    """
    Describes a service visit to the family. Access is based on the user's access to the related family.
    """
    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = HomeVisit

        fields = (
            'home_visit_id',
            'family',
            'person',
            'ref_home_visit_location',
            'visit_date',
            'service_minutes',
            'visit_notes',
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

            # Does the user have read access to the supplied location?
            ref_home_visit_location = validated_data.get('ref_home_visit_location', None)
            if ref_home_visit_location:
                if not ref_home_visit_location.universal:
                    if ref_home_visit_location.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected home visit location."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied home visitor?
            person = validated_data.get('person', None)
            if person:
                if person.organization.filter(
                    organization_id__in=Organization.objects.get_read_orgs(request.user)
                ).count() == 0:
                    raise PermissionDenied(detail="Read access to the supplied person is required.")
            else:
                raise ValidationError(detail="No person was supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(HomeVisitSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
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

            # Does the user have read access to the supplied location?
            ref_home_visit_location = validated_data.get('ref_home_visit_location', None)
            if ref_home_visit_location:
                if not ref_home_visit_location.universal:
                    if ref_home_visit_location.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected home visit location."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied home visitor?
            person = validated_data.get('person', None)
            if person:
                if person.organization.filter(
                    organization_id__in=Organization.objects.get_read_orgs(request.user)
                ).count() == 0:
                    raise PermissionDenied(detail="Read access to the supplied person is required.")
            else:
                raise ValidationError(detail="No person was supplied.")

            # If we've made it here, we can update the record:
            validated_data['modified_by'] = request.user
            return super(HomeVisitSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")


class ContactLogSerializer(serializers.ModelSerializer):
    """
    Describes a contact between staff and a family member
    """

    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = ContactLog

        fields = (
            'contact_log_id',
            'family',
            'family_member',
            'employee',
            'ref_contact_type',
            'contact_date',
            'service_minutes',
            'contact_log_notes',
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

            # Does the user have read access to the supplied contact type?
            ref_contact_type = validated_data.get('ref_contact_type', None)
            if ref_contact_type:
                if not ref_contact_type.universal:
                    if ref_contact_type.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected contact type."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied staff person?
            employee = validated_data.get('employee', None)
            if employee:
                if employee.organization.filter(
                    organization_id__in=Organization.objects.get_read_orgs(request.user)
                ).count() == 0:
                    raise PermissionDenied(detail="Read access to the supplied employee is required.")
            else:
                raise ValidationError(detail="No employee was supplied.")

            # Is the supplied family member a member of the given family?
            child_linked = False
            adult_linked = False

            family_member = validated_data.get('family_member', None)
            if family_member:
                if family.childfamilyrelationship_set.filter(
                        child__person__person_id=family_member.person_id).count() == 0:
                    child_linked = False
                else:
                    child_linked = True

                if not child_linked:
                    if family.adultfamilyrelationship_set.filter(
                            adult__person__person_id=family_member.person_id).count() == 0:
                        adult_linked = False
                    else:
                        adult_linked = True

                if (not child_linked) and (not adult_linked):
                    raise ValidationError(detail="Family member must be linked to the supplied family.")
            else:
                raise ValidationError(detail="No family member was supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(ContactLogSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
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

            # Does the user have read access to the supplied contact type?
            ref_contact_type = validated_data.get('ref_contact_type', None)
            if ref_contact_type:
                if not ref_contact_type.universal:
                    if ref_contact_type.organization not in Organization.objects.get_read_orgs(request.user):
                        error_msg = "Read permissions are required for the selected contact type."
                        raise PermissionDenied(detail=error_msg)

            # Does the user have read access to the supplied staff person?
            employee = validated_data.get('employee', None)
            if employee:
                if employee.organization.filter(
                    organization_id__in=Organization.objects.get_read_orgs(request.user)
                ).count() == 0:
                    raise PermissionDenied(detail="Read access to the supplied employee is required.")
            else:
                raise ValidationError(detail="No employee was supplied.")

            # Is the supplied family member a member of the given family?
            child_linked = False
            adult_linked = False

            family_member = validated_data.get('family_member', None)
            if family_member:
                if family.childfamilyrelationship_set.filter(
                        child__person__person_id=family_member.person_id).count() == 0:
                    child_linked = False
                else:
                    child_linked = True

                if not child_linked:
                    if family.adultfamilyrelationship_set.filter(
                            adult__person__person_id=family_member.person_id).count() == 0:
                        adult_linked = False
                    else:
                        adult_linked = True

                if (not child_linked) and (not adult_linked):
                    raise ValidationError(detail="Family member must be linked to the supplied family.")
            else:
                raise ValidationError(detail="No family member was supplied.")

            # If we've made it here, we can update the record:
            validated_data['modified_by'] = request.user
            return super(ContactLogSerializer, self).update(instance, validated_data)

        else:
            raise ValidationError(detail="No request context provided")