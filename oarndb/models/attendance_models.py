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

from django.db import models
from oarndb.models import BaseModel


class Classroom(BaseModel):
    """
    Defines a physical classroom
    """
    classroom_id = models.AutoField(
        'classroom_id',
        primary_key=True
    )

    organization = models.ForeignKey(
        'Organization',
        null=False
    )

    location = models.ForeignKey(
        "OrganizationLocation",
        null=False
    )

    name = models.CharField('name', max_length=60, null=False)

    class Meta:
        db_table = "classroom"


class ClassSchedule(BaseModel):
    """
    Defines a logical class within a physical classroom
    """
    class_schedule_id = models.AutoField(
        'class_schedule_id',
        primary_key=True
    )

    name = models.CharField('name', max_length=60, null=False)

    classroom = models.ForeignKey('Classroom', null=False)

    sunday = models.BooleanField(default=False)

    monday = models.BooleanField(default=False)

    tuesday = models.BooleanField(default=False)

    wednesday = models.BooleanField(default=False)

    thursday = models.BooleanField(default=False)

    friday = models.BooleanField(default=False)

    saturday = models.BooleanField(default=False)

    class Meta:
        db_table = "class_schedule"


class PersonClassSchedule(BaseModel):
    """
    Defines a person's assignment to a particular class schedule, with any variances taken into account
    """
    person_class_schedule_id = models.AutoField(
        'person_class_schedule_id',
        primary_key=True
    )

    person = models.ForeignKey('Person', null=False)

    class_schedule = models.ForeignKey('ClassSchedule', null=False)

    begin_date = models.DateField(
        'begin_date',
        auto_now=False,
        auto_now_add=False
    )

    end_date = models.DateField(
        'end_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    sunday = models.BooleanField(default=False)

    monday = models.BooleanField(default=False)

    tuesday = models.BooleanField(default=False)

    wednesday = models.BooleanField(default=False)

    thursday = models.BooleanField(default=False)

    friday = models.BooleanField(default=False)

    saturday = models.BooleanField(default=False)

    class Meta:
        db_table = "person_class_schedule"


class PersonAttendance(BaseModel):
    """
    Defines a single instance of a person's attendance in a classroom
    """
    person_attendance_id = models.AutoField(
        'person_attendance_id',
        primary_key=True
    )

    person = models.ForeignKey('Person', null=False)

    class_schedule = models.ForeignKey('ClassSchedule', null=False)

    attendance_date = models.DateField(
        'attendance_date',
        auto_now=False,
        auto_now_add=False
    )

    attendance_status = models.ForeignKey('RefAttendanceStatus', null=False)

    class Meta:
        db_table = "person_attendance"