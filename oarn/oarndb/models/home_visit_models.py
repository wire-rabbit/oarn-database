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


class HomeVisit(BaseModel):
    """
    Describes a service visit to the family.
    """

    home_visit_id = models.AutoField(
        'family_enrollment_id',
        primary_key=True
    )

    family = models.ForeignKey(
        "Family",
        verbose_name='family'
    )

    person = models.ForeignKey(
        "Person",
        verbose_name='person'
    )

    ref_home_visit_location = models.ForeignKey(
        "RefHomeVisitLocation",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    visit_date = models.DateField(
        'visit_date',
        auto_now=False,
        auto_now_add=False
    )

    service_minutes = models.IntegerField(default=0)

    visit_notes = models.CharField('visit_notes', max_length=10000, null=True, blank=True)

    class Meta:
        db_table = "home_visit"


class ContactLog(BaseModel):
    """
    Describes a contact between staff and a family member
    """

    contact_log_id = models.AutoField(
        'contact_log_id',
        primary_key=True
    )

    family = models.ForeignKey(
        "Family",
        verbose_name='family'
    )

    family_member = models.ForeignKey(
        "Person",
        related_name="contact_log_family_members"
    )

    employee = models.ForeignKey(
        "Person",
        related_name="contact_log_employees"
    )

    ref_contact_type = models.ForeignKey(
        "RefContactType",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    service_minutes = models.IntegerField(default=0)

    contact_date = models.DateField(
        'contact_date',
        auto_now=False,
        auto_now_add=False
    )

    contact_log_notes = models.CharField('contact_log_notes', max_length=10000, null=True, blank=True)

    class Meta:
        db_table = "contact_log"