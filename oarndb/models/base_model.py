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
from django.contrib.auth.models import Group, User

class BaseModel(models.Model):
    """
    A set of common model attributes for every table in the OARN model.
    """

    created_by = models.ForeignKey(
        User, 
        verbose_name='created_by', 
        related_name='%(class)s_created_by',
        null=True, # We need to be able to add the first Person, for example
        blank=True
    )
    created_at = models.DateTimeField("created_at", auto_now_add=True)

    modified_by = models.ForeignKey(
        User, 
        verbose_name='modified_by', 
        related_name='%(class)s_modified_by',
        null=True,
        blank=True
    )
    modified_at = models.DateTimeField("modified_at", auto_now=True)

    class Meta:
        abstract = True
        app_label = "oarndb"


