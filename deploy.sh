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

# This script copies the oarndb file hierarchy - pulled down from Git - to the
# correct folders in $OARNDIR, which should point to the Django project.
# The git files are to be located in $REPO.

rsync -av $REPO/oarn/oarn/ $OARNDIR/oarn/ --exclude-from $REPO/exclude.txt
rsync -av $REPO/oarn/oarndb/ $OARNDIR/oarndb/ --exclude-from $REPO/exclude.txt
rsync -av $REPO/oarn/oarndb/static/ $OARNDIR/static/ --exclude-from $REPO/exclude.txt
rsync -av $REPO/oarn/templates/ $OARNDIR/templates/ --exclude-from $REPO/exclude.txt
