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

from django.http import HttpResponse
from django.template import RequestContext, loader


def index(request):
    template = loader.get_template('index.html')
    context = RequestContext(request, {})
    return HttpResponse(template.render(context))


def support(request):
    template = loader.get_template('support.html')
    context = RequestContext(request, {})
    return HttpResponse(template.render(context))


def license(request):
    template = loader.get_template('license.html')
    context = RequestContext(request, {})
    return HttpResponse(template.render(context))


def debug(request):
    template = loader.get_template('debug.html')
    context = RequestContext(request, {})
    return HttpResponse(template.render(context))