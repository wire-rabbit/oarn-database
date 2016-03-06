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

from datetime import datetime
from django.db.models import Q
from django.http import Http404
from rest_framework import permissions, generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from oarndb.views import base_views

from oarndb.serializers import ClassroomSerializer, ClassScheduleSerializer
from oarndb.serializers import PersonClassScheduleSerializer, PersonAttendanceSerializer
from oarndb.serializers import CreateAttendanceRecordsSerializer
from oarndb.models import Classroom, ClassSchedule, Organization, PersonClassSchedule, PersonAttendance


class ClassroomList(generics.ListCreateAPIView):
    """
    Defines a physical classroom at a given organization. Administrative access for the
    organization is required for creation and updates.
    """
    serializer_class = ClassroomSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Classroom.objects.filter(
            organization__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('location', 'name')


class ClassroomDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Defines a physical classroom at a given organization. Administrative access for the
    organization is required for creation and updates.
    """
    serializer_class = ClassroomSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Classroom.objects.filter(
            organization__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('location', 'name')


    def delete(self, request, *args, **kwargs):
        try:
            obj = Classroom.objects.get(pk=kwargs.get('pk', None))
        except Classroom.DoesNotExist:
            raise Http404

        if Organization.objects.get_admin_orgs(request.user).filter(
                organization_id=obj.organization.organization_id
            ).count() == 0:
            error_msg = "Admin permissions for this organization are required to delete a classroom"
            raise PermissionDenied(detail=error_msg)

        return super(ClassroomDetail, self).delete(self, request, *args, **kwargs)


class ClassScheduleList(generics.ListCreateAPIView):
    """
    Defines a class schedule in a given classroom. Administrative access to the classroom's organization
    is required for creation and updates.
    """
    serializer_class = ClassScheduleSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return ClassSchedule.objects.filter(
                classroom__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('classroom', 'name')
        else:
            classroom_id_filter = self.request.query_params.get('classroom_id', None)
            if classroom_id_filter:
                return ClassSchedule.objects.filter(classroom=classroom_id_filter).filter(
                    classroom__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('classroom', 'name')
            else:
                # We need to return the default so that pagination doesn't break
                return ClassSchedule.objects.filter(
                    classroom__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('classroom', 'name')


class ClassScheduleDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Defines a class schedule in a given classroom. Administrative access to the classroom's organization
    is required for creation and updates.
    """
    serializer_class = ClassScheduleSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return ClassSchedule.objects.filter(
            classroom__organization__in=Organization.objects.get_read_orgs(self.request.user)
        ).order_by('classroom', 'name')

    def delete(self, request, *args, **kwargs):
        try:
            obj = ClassSchedule.objects.get(pk=kwargs.get('pk', None))
        except ClassSchedule.DoesNotExist:
            raise Http404

        if Organization.objects.get_admin_orgs(request.user).filter(
                organization_id=obj.classroom.organization.organization_id
            ).count() == 0:
            error_msg = "Admin permissions for this organization are required to delete a class schedule"
            raise PermissionDenied(detail=error_msg)

        return super(ClassScheduleDetail, self).delete(self, request, *args, **kwargs)


class PersonClassScheduleList(generics.ListCreateAPIView):
    """
    Defines the participation schedule for a person in a class. Write access to the person is required.
    """
    serializer_class = PersonClassScheduleSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return PersonClassSchedule.objects.filter(
                class_schedule__classroom__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('class_schedule', 'person')
        else:
            person_id_filter = self.request.query_params.get('person_id', None)
            if person_id_filter:
                return PersonClassSchedule.objects.filter(
                    class_schedule__classroom__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).filter(person__person_id=person_id_filter).order_by('person', 'class_schedule')
            else:
                # We need to return the default so that pagination doesn't break
                return PersonClassSchedule.objects.filter(
                    class_schedule__classroom__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('class_schedule', 'person')


class PersonClassScheduleDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Defines the participation schedule for a person in a class. Write access to the person is required.
    """
    serializer_class = PersonClassScheduleSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return PersonClassSchedule.objects.filter(
                class_schedule__classroom__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('class_schedule', 'person')

    def delete(self, request, *args, **kwargs):
        try:
            obj = PersonClassSchedule.objects.get(pk=kwargs.get('pk', None))
        except PersonClassSchedule.DoesNotExist:
            raise Http404

        if Organization.objects.get_readwrite_orgs(request.user).filter(
                organization_id=obj.class_schedule.classroom.organization.organization_id
            ).count() == 0:
            error_msg = "Write permissions for this organization are required to delete a person's class schedule"
            raise PermissionDenied(detail=error_msg)

        return super(PersonClassScheduleDetail, self).delete(self, request, *args, **kwargs)


class PersonAttendanceList(generics.ListCreateAPIView):
    """
    Defines the actual attendance details for a given person in a given class schedule.
    Write access to the person are required.
    """
    serializer_class = PersonAttendanceSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if len(self.request.query_params) == 0:
            return PersonAttendance.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('class_schedule','attendance_date','person')
        else:
            person_id_filter = self.request.query_params.get('person_id', None)
            class_schedule_id_filter = self.request.query_params.get('class_schedule_id', None)
            date_filter = self.request.query_params.get('attendance_date', None)

            if class_schedule_id_filter and date_filter and not person_id_filter:
                # This is actually the primary set of filters: attendance by day and class session:
                try:
                    attendance_date = datetime.strptime(date_filter, '%Y-%m-%d')
                except ValueError:
                    raise ValidationError(detail="Bad format in date parameter")
                return PersonAttendance.objects.filter(attendance_date=attendance_date).filter(
                    class_schedule__class_schedule_id=class_schedule_id_filter).filter(
                    person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('class_schedule', 'attendance_date', 'person__last_name')
            else:
                # We need to return the default so that pagination doesn't break
                return PersonAttendance.objects.filter(
                    person__organization__in=Organization.objects.get_read_orgs(self.request.user)
                ).order_by('class_schedule','attendance_date','person')


class PersonAttendanceDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    Defines the actual attendance details for a given person in a given class schedule.
    Write access to the person are required.
    """
    serializer_class = PersonAttendanceSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return PersonAttendance.objects.filter(
                person__organization__in=Organization.objects.get_read_orgs(self.request.user)
            ).order_by('class_schedule','attendance_date','person')

    def delete(self, request, *args, **kwargs):
        try:
            obj = PersonAttendance.objects.get(pk=kwargs.get('pk', None))
        except PersonAttendance.DoesNotExist:
            raise Http404

        if Organization.objects.get_readwrite_orgs(request.user).filter(
                organization_id=obj.class_schedule.classroom.organization.organization_id
            ).count() == 0:
            error_msg = "Write permissions for this organization are required to delete an attendance record"
            raise PermissionDenied(detail=error_msg)

        return super(PersonAttendanceDetail, self).delete(self, request, *args, **kwargs)


class CreateAttendanceRecords(generics.CreateAPIView):
    """
    A POST-only endpoint, it creates a set of PersonAttendance records for a given date
    and given class schedule, based on the defaults for the PersonClassSchedule records that
    intersect with the date and class. Write access to the individuals involved is required.
    An 'Attended' and a 'Not Scheduled' value are required in RefAttendanceStatus.
    """

    serializer_class = CreateAttendanceRecordsSerializer
    permission_classes = (permissions.IsAuthenticated,)