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


class Waitlist(BaseModel):
    """
    Describes the history of a family's time on an agency's waitlist, including the staff person assigned
    to handle the intake and their current status.
    """

    waitlist_id = models.AutoField(
        'waitlist_id',
        primary_key=True
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

    family = models.ForeignKey('Family', verbose_name='family', related_name='waitlist_family')

    assigned_to_employee = models.ForeignKey('Person', related_name='intake_staff_assigned')

    assigned_date = models.DateField(
        'assigned_date',
        auto_now=False,
        auto_now_add=False,
        null=True,
        blank=True
    )

    ref_referred_from = models.ForeignKey('RefReferredFrom', null=True, related_name='referred_from')

    ref_waitlist_status = models.ForeignKey('RefWaitlistStatus', null=True, related_name='waitlist_status')

    child_under_three = models.BooleanField(default=False)

    child_under_five = models.BooleanField(default=False)

    open_child_welfare_case = models.BooleanField(default=False)

    mother_is_pregnant = models.BooleanField(default=False)

    service_need_1 = models.ForeignKey('RefServiceNeed', null=True, related_name='service_need_1')

    service_need_2 = models.ForeignKey('RefServiceNeed', null=True, related_name='service_need_2')

    service_need_3 = models.ForeignKey('RefServiceNeed', null=True, related_name='service_need_3')

    service_need_4 = models.ForeignKey('RefServiceNeed', null=True, related_name='service_need_4')

    service_need_5 = models.ForeignKey('RefServiceNeed', null=True, related_name='service_need_5')

    service_need_6 = models.ForeignKey('RefServiceNeed', null=True, related_name='service_need_6')

    notes = models.CharField(max_length=5000, null=True, blank=True)

    class Meta:
        db_table = "waitlist"