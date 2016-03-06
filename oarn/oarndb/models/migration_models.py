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


class MigrationPerson(models.Model):
    """
    Keeps track of the old PK for a person and the new Person record after object creation in this database.
    """

    organization = models.ForeignKey('Organization')

    old_pk = models.CharField(max_length=30)

    person = models.ForeignKey('Person')

    is_child = models.BooleanField(default=False)

    mode = models.CharField(max_length=30) # client, staff

    def __str__(self):
        return self.person.__str__() + ': prior database primary key: ' + str(self.old_pk)

    class Meta:
        db_table = "migration_person"


class MigrationFamily(models.Model):
    """
    This is where prior database family ids are maintained.
    """

    organization = models.ForeignKey('Organization')

    old_family_id = models.CharField(max_length=30)

    family = models.ForeignKey('Family')

    class Meta:
        db_table = "migration_family"