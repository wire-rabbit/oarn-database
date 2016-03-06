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

from django.conf.urls import patterns, include, url
from django.contrib import admin
from oarndb.views import main_views

admin.sites.AdminSite.site_header = "OARN Database Administration"
admin.sites.AdminSite.site_title = "OARN Database Administration"

urlpatterns = patterns(
    '',
    url(r'^$', main_views.index),
    url(r'^support/$', main_views.support),
    url(r'^license/$', main_views.license),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^auth/', include('djoser.urls')),
    url(r'^api/v1/', include('oarndb.urls')),
)
