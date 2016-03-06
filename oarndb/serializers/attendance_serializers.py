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

import datetime
from django.contrib.auth.models import User, Group
from django.db.models import Q

from rest_framework import serializers, status
from rest_framework.exceptions import ValidationError, PermissionDenied

from oarndb.models import Classroom, ClassSchedule, PersonClassSchedule, PersonAttendance, Organization
from oarndb.models import RefAttendanceStatus


class ClassroomSerializer(serializers.ModelSerializer):
    """
    Defines a physical classroom
    """
    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = Classroom
        fields = (
            'classroom_id',
            'organization',
            'location',
            'name',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        """
        Determines whether the given user has read or write access to the record.
        Here this is based on the organization directly, but requires local admin access.
        """
        request = self.context.get('request', None)
        error_msg = "User has insufficient rights for this operation."

        if request is not None:
            if Organization.objects.get_admin_orgs(request.user).filter(
                organization_id=obj.organization.organization_id
            ).count() > 0:
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
            # Does the user have write access to this organization?
            org = validated_data.get('organization', None)
            if org:
                if Organization.objects.get_admin_orgs(request.user).filter(
                        organization_id=org.organization_id).count() == 0:
                    raise PermissionDenied(detail="Admin rights to this organization are required.")
            else:
                raise ValidationError(detail="No organization supplied")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(ClassroomSerializer, self).create(validated_data)

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
            return super(ClassroomSerializer, self).update(instance, validated_data)
        else:
            raise ValidationError(detail="No request context provided")


class ClassScheduleSerializer(serializers.ModelSerializer):
    """
    Defines a logical class within a physical classroom
    """
    read_only = serializers.SerializerMethodField('is_read_only')

    class Meta:
        model = ClassSchedule
        fields = (
            'class_schedule_id',
            'name',
            'classroom',
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        request = self.context.get('request', None)
        error_msg = "User has insufficient rights for this operation."

        if request is not None:
            if Organization.objects.get_admin_orgs(request.user).filter(
                organization_id=obj.classroom.organization.organization_id
            ).count() > 0:
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
            # Does the user have write access to this organization?
            classroom = validated_data.get('classroom', None)
            if classroom:
                if Organization.objects.get_admin_orgs(request.user).filter(
                        organization_id=classroom.organization.organization_id).count() == 0:
                    raise PermissionDenied(detail="Admin rights to this classroom's organization are required.")
            else:
                raise ValidationError(detail="No classroom supplied")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(ClassScheduleSerializer, self).create(validated_data)

        else:
            raise ValidationError(detail="No request context provided")

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have admin rights to the instance organization?
            if Organization.objects.get_admin_orgs(request.user).filter(
                        organization_id=instance.classroom.organization.organization_id).count() == 0:
                    raise PermissionDenied(detail="Admin rights to the instance organization are required.")

            # Does the user have admin rights to the supplied organization?
            classroom = validated_data.get('classroom', None)
            if classroom:
                if Organization.objects.get_admin_orgs(request.user).filter(
                        organization_id=classroom.organization.organization_id).count() == 0:
                    raise PermissionDenied(detail="Admin rights to this classroom's organization are required.")
            else:
                raise ValidationError(detail="No classroom supplied")

            # If we've made it here, we can update the record:
            validated_data['modified_by'] = request.user
            return super(ClassScheduleSerializer, self).update(instance, validated_data)
        else:
            raise ValidationError(detail="No request context provided")


class PersonClassScheduleSerializer(serializers.ModelSerializer):
    """
    Defines a person's membership in a scheduled class
    """
    read_only = serializers.SerializerMethodField('is_read_only')

    classroom = serializers.SerializerMethodField('link_to_classroom')

    class Meta:
        model = PersonClassSchedule
        fields = (
            'person_class_schedule_id',
            'person',
            'class_schedule',
            'classroom',
            'begin_date',
            'end_date',
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        request = self.context.get('request', None)
        error_msg = "User has insufficient rights for this operation."

        if request is not None:
            if Organization.objects.get_readwrite_orgs(request.user).filter(
                organization_id=obj.class_schedule.classroom.organization.organization_id
            ).count() > 0:
                return False
            else:
                return True
        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def link_to_classroom(self, obj):
        return obj.class_schedule.classroom.classroom_id

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to this organization?
            class_schedule = validated_data.get('class_schedule', None)
            if class_schedule:
                if Organization.objects.get_readwrite_orgs(request.user).filter(
                        organization_id=class_schedule.classroom.organization.organization_id).count() == 0:
                    raise PermissionDenied(detail="Write rights for this organization are required for this operation.")
            else:
                raise ValidationError(detail="No class schedule supplied")

            # Does the usre have write access to the supplied person?
            person = validated_data.get('person', None)
            if person:
                if person.organization.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this person record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="Person was not supplied")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(PersonClassScheduleSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the instance organization?
            if Organization.objects.get_readwrite_orgs(request.user).filter(
                        organization_id=instance.class_schedule.classroom.organization.organization_id).count() == 0:
                    raise PermissionDenied(detail="Write rights to the instance organization are required.")

            # Does the user have write rights to the supplied organization?
            class_schedule = validated_data.get('class_schedule', None)
            if class_schedule:
                if Organization.objects.get_readwrite_orgs(request.user).filter(
                        organization_id=class_schedule.classroom.organization.organization_id).count() == 0:
                    raise PermissionDenied(detail="Write rights for this organization are required for this operation.")
            else:
                raise ValidationError(detail="No class schedule supplied")

            # Does the user have write access to the supplied person?
            person = validated_data.get('person', None)
            if person:
                if person.organization.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this person record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No person supplied")

            # If we've made it here, we can update the record:
            validated_data['modified_by'] = request.user
            return super(PersonClassScheduleSerializer, self).update(instance, validated_data)
        else:
            raise ValidationError(detail="No request context provided")


class PersonAttendanceSerializer(serializers.ModelSerializer):
    """
    Defines a single instance of a person's attendance in a classroom
    """
    read_only = serializers.SerializerMethodField('is_read_only')

    last_name = serializers.SerializerMethodField('link_to_last_name')

    first_name = serializers.SerializerMethodField('link_to_first_name')

    person_id = serializers.SerializerMethodField('link_to_person_id')

    class Meta:
        model = PersonAttendance
        fields = (
            'person_attendance_id',
            'person',
            'person_id',
            'last_name',
            'first_name',
            'class_schedule',
            'attendance_date',
            'attendance_status',
            'created_by',
            'created_at',
            'modified_at',
            'modified_by',
            'read_only'
        )

    def is_read_only(self, obj):
        request = self.context.get('request', None)
        error_msg = "User has insufficient rights for this operation."

        if request is not None:
            if obj.person.organization.filter(
                organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
            ).count() > 0:
                return False
            else:
                return True
        else:
            # If there is no request, we have no user data and
            # shouldn't be seeing results:
            raise ValidationError(detail="No request context was provided.")

    def link_to_person_id(self, obj):
        return obj.person.person_id

    def link_to_last_name(self, obj):
        return obj.person.last_name

    def link_to_first_name(self, obj):
        return obj.person.first_name

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the supplied person?
            person = validated_data.get('person', None)
            if person:
                if person.organization.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this person record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="Person was not supplied.")

            # Does the user have write access to the supplied class schedule?
            class_schedule = validated_data.get('class_schedule', None)
            if class_schedule:
                if Organization.objects.get_admin_orgs(request.user).filter(
                        organization_id=class_schedule.classroom.organization.organization_id).count() == 0:
                    raise PermissionDenied(detail="Write rights for this organization are required for this operation.")
            else:
                raise ValidationError(detail="Class schedule was not supplied.")

            # If we've made it here, we can create the record:
            validated_data['created_by'] = request.user
            return super(PersonAttendanceSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request', None)
        if request:
            # Does the user have write access to the instance organization?
            if Organization.objects.get_readwrite_orgs(request.user).filter(
                        organization_id=instance.class_schedule.classroom.organization.organization_id).count() == 0:
                    raise PermissionDenied(detail="Write rights to the instance organization are required.")

            # Does the user have write access to the supplied person?
            person = validated_data.get('person', None)
            if person:
                if person.organization.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this person record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="Person was not supplied.")

            # Does the user have write rights to the supplied organization?
            class_schedule = validated_data.get('class_schedule', None)
            if class_schedule:
                if Organization.objects.get_readwrite_orgs(request.user).filter(
                        organization_id=class_schedule.classroom.organization.organization_id).count() == 0:
                    raise PermissionDenied(detail="Write rights for this organization are required for this operation.")
            else:
                raise ValidationError(detail="No class schedule supplied")

            # Does the user have write access to the supplied person?
            person = validated_data.get('person', None)
            if person:
                if person.organization.filter(
                        organization_id__in=Organization.objects.get_readwrite_orgs(request.user)
                ).count() == 0:
                    error_msg = "Write permissions are required for this person record."
                    raise PermissionDenied(detail=error_msg)
            else:
                raise ValidationError(detail="No person supplied")

            # If we've made it here, we can update the record:
            validated_data['modified_by'] = request.user
            return super(PersonAttendanceSerializer, self).update(instance, validated_data)
        else:
            raise ValidationError(detail="No request context provided")


class AttendanceResultSerializer(serializers.Serializer):
    """
    Used in the CreateAttendanceRecordsSerializer to provide result details - currently this is not
    really used and might be usefully cut.
    """
    first_name = serializers.CharField(max_length=50, allow_null=True)


class CreateAttendanceRecordsSerializer(serializers.Serializer):
    """
    For a POST-only endpoint, it creates a set of PersonAttendance records for a given date
    and given class schedule, based on the defaults for the PersonClassSchedule records that
    intersect with the date and class.
    """

    attendance_date = serializers.DateField(allow_null=True, write_only=True)
    class_schedule_id = serializers.IntegerField(min_value=1, write_only=True)

    attendanceResults = AttendanceResultSerializer(many=True, read_only=True)

    def create(self, validated_data):
        request = self.context.get('request', None)
        if request:
            # Get the relevant class schedule:
            try:
                class_schedule = ClassSchedule.objects.get(pk=validated_data.get('class_schedule_id'))
            except ClassSchedule.DoesNotExist:
                raise ValidationError('Class schedule not found')

            # Does the user have write access to that class schedule?
            if Organization.objects.get_readwrite_orgs(request.user).filter(
                    organization_id=class_schedule.classroom.organization.organization_id).count() == 0:
                raise PermissionDenied(detail="Write access to the class schedule is required")

            # Get the weekday for the date under examination (0 == Monday):
            attendance_date = validated_data.get('attendance_date')
            weekday = attendance_date.weekday()

            # Get all of the PersonClassSchedule records for the supplied class schedule:
            attendees = PersonClassSchedule.objects.filter(class_schedule=class_schedule).filter(
                Q(begin_date__lte=attendance_date), (Q(end_date=None) | Q(end_date__gte=attendance_date))
            )

            # Get 'Attended' and 'Not Scheduled' from RefAttendanceStatus:
            try:
                attended = RefAttendanceStatus.objects.get(description='Attended')
            except RefAttendanceStatus.DoesNotExist:
                raise ValidationError(detail='RefAttendanceStatus for "Attended" does not exist')

            try:
                not_scheduled = RefAttendanceStatus.objects.get(description='Not Scheduled')
            except RefAttendanceStatus.DoesNotExist:
                raise ValidationError(detail='RefAttendanceStatus for "Not Scheduled" does not exist')

            # Delete existing records for this session on this day:
            PersonAttendance.objects.filter(attendance_date=attendance_date).filter(
                class_schedule=class_schedule).delete()

            # For each PersonClassSchedule record, create the PersonAttendance record, using either
            # 'Attended' or 'Not Scheduled' for the status.
            for item in attendees:
                did_attend = False
                if item.monday and weekday == 0:
                    did_attend = True
                elif item.tuesday and weekday == 1:
                    did_attend = True
                elif item.wednesday and weekday == 2:
                    did_attend = True
                elif item.thursday and weekday == 3:
                    did_attend = True
                elif item.friday and weekday == 4:
                    did_attend = True
                elif item.saturday and weekday == 5:
                    did_attend = True
                elif item.sunday and weekday == 6:
                    did_attend = True

                item_status = attended
                if not did_attend:
                    item_status = not_scheduled

                PersonAttendance.objects.create(
                    person=item.person,
                    class_schedule=class_schedule,
                    attendance_date=attendance_date,
                    attendance_status=item_status,
                    created_by=request.user
                )

            return { }
        else:
            raise ValidationError(detail="No request context provided")