from rest_framework.response import Response
from dj_rest_auth.views import LoginView
from rest_framework import status

class MobileLoginView(LoginView):
    def post(self, request, *args, **kwargs):
        # Check if the request is from a mobile client
        if request.headers.get('X-Client-Type') == 'mobile':
            self.request = request
            self.serializer = self.get_serializer(data=self.request.data)
            self.serializer.is_valid(raise_exception=True)

            self.login()

            # For mobile, return tokens in the response body
            return Response({
                'access_token': str(self.access_token),
                'refresh_token': str(self.refresh_token),
                'user': self.serializer.data,
            }, status=status.HTTP_200_OK)
        else:
            # For web, proceed with default cookie-based authentication
            return super().post(request, *args, **kwargs)
