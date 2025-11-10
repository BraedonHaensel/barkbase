## API documentations

- Can be found in http://127.0.0.1:5000/apidocs/.

### Trying out autheorized requests

1. You need to include a valid JWT token to do so. Obtain the JWT token by logging into a valid account (if you don't know a valid account that exists, just create one using the `POST auth/signup` endpoint).
2. After obtaining the token, click the "Authorize" button at the top of the page and paste it there: `Bearer <token>`. Subsequent authorized requests will automatically use that token.
