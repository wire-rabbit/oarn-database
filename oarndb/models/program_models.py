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

from oarndb.models.base_model import BaseModel


class FamilyEnrollment(BaseModel):
    """
    Links a family to a program.
    """

    family_enrollment_id = models.AutoField(
        'family_enrollment_id', 
        primary_key=True
    )

    family = models.ForeignKey(
        "Family",
        verbose_name='family'
    )

    ref_program = models.ForeignKey(
        "RefProgram", 
        verbose_name='ref_program'
    )

    location = models.ForeignKey(
        "OrganizationLocation",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    open_date = models.DateField(
        'open_date',
        auto_now=False,
        auto_now_add=False
    )

    close_date = models.DateField(
        'close_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'family_enrollment'

    def __str__(self):
        return self.family_id.__str__() + ': ' + \
            self.ref_program.__str__() + ': ' + \
            self.open_date.__str__()


class ServiceLevelEnrollment(BaseModel):
    """
    Links a program to a service level.
    """

    service_level_enrollment_id = models.AutoField(
        'service_level_enrollment_id',
        primary_key=True
    )

    family_enrollment = models.ForeignKey(
        "FamilyEnrollment",
        verbose_name='family_enrollment'
    )

    ref_service_level = models.ForeignKey(
        "RefServiceLevel",
        verbose_name='ref_service_level'
    )

    open_date = models.DateField(
        'open_date',
        auto_now=False,
        auto_now_add=False
    )

    close_date = models.DateField(
        'close_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    class Meta:
        db_table = "service_level_enrollment"

    def __str__(self):
        return str(self.service_level_enrollment_id) + ': ' + \
            self.ref_service_level.__str__() + ': ' + \
            self.open_date.__str__()


class PersonEnrollment(BaseModel):
    """
    Links an individual person to a program.
    """

    person_enrollment_id = models.AutoField(
        'person_enrollment_id', 
        primary_key=True
    )

    person = models.ForeignKey(
        "Person", 
        verbose_name='person'
    )

    family_enrollment = models.ForeignKey(
        "FamilyEnrollment",
        verbose_name='family_enrollment'   
    )

    open_date = models.DateField(
        'open_date',
        auto_now=False,
        auto_now_add=False      
    )

    close_date = models.DateField(
        'close_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'person_enrollment'

    def __str__(self):
        return self.person.__str__() + ': ' +\
            self.family_enrollment.__str__() + ': open date ' +\
            str(self.open_date) + ', close date: ' +\
            str(self.close_date)


class CaseManager(BaseModel):
    """
    Identifies an employee as being responsible for services to 
    a given person.
    """

    case_manager_id = models.AutoField(
        'case_manager_id',
        primary_key=True
    )

    # Identifies the case manager:
    person = models.ForeignKey(
        "Person",
        verbose_name="person"
    )

    family = models.ForeignKey(
        "Family",
        verbose_name="family"
    )

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

    class Meta:
        db_table = 'case_manager'

    def __str__(self):
        return self.person.__str__() + ': ' +\
            'Family ID ' + self.family.__str__() + ': ' +\
            'Begin Date: ' + str(self.begin_date) + ': ' +\
            'End Date: ' + str(self.end_date)
