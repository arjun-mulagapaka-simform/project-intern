from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsPostOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj is not None and request.user == obj.user
