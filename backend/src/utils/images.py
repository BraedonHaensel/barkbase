from flask import url_for
import os
import uuid

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}


def generate_unique_filename(dir, extension):
    """
    Generates a unique filename for a file with the given extension in the given directory.
    """
    while True:
        filename = f"{uuid.uuid4()}.{extension}"
        if not os.path.exists(os.path.join(dir, filename)):
            return filename


def get_extension(filename):
    """Parses the extension from a filename."""
    # CITATION:
    #   File uploads made easy with react and flask. (n.d.). Dunder Method Paper Company.
    #   Retrieved November 10, 2025, from https://dundermethodpaperco.hashnode.dev/file-uploads-made-easy-with-react-and-flask
    return filename.rsplit('.', 1)[1].lower()


def allowed_filename(filename):
    """Checks if a filename has a valid image extension."""
    # CITATION Developed with reference to:
    #   File uploads made easy with react and flask. (n.d.). Dunder Method Paper Company.
    #   Retrieved November 10, 2025, from https://dundermethodpaperco.hashnode.dev/file-uploads-made-easy-with-react-and-flask
    return '.' in filename and get_extension(filename) in ALLOWED_EXTENSIONS


def validate_image_file(file):
    """Validates an image file."""
    return allowed_filename(file.filename)


def save_image(app, image_dirname, file):
    """Saves an image file to the specified directory in the images directory."""
    # CITATION: Developed with reference to:
    #   File uploads made easy with react and flask. (n.d.). Dunder Method Paper Company.
    #   Retrieved November 10, 2025, from https://dundermethodpaperco.hashnode.dev/file-uploads-made-easy-with-react-and-flask
    dest_dir = os.path.join(app.config['IMAGES_DIR'], image_dirname)
    filename = generate_unique_filename(dest_dir, get_extension(file.filename))
    file.save(os.path.join(dest_dir, filename))
    return filename


def save_user_image(app, file):
    """Saves a user image file to the images directory."""
    return save_image(app, 'users', file)


def save_dog_image(app, file):
    """Saves a dog image file to the images directory."""
    filename = save_image(app, 'dogs', file)
    print(f"Saving file got {filename} from {file.filename}")
    return filename


def get_user_image_url(filename):
    """Gets the static url for a user image file."""
    return url_for('static', filename=f"images/users/{filename}", _external=True)


def get_dog_image_url(filename):
    """Gets the static url for a dog image file."""
    return url_for('static', filename=f"images/dogs/{filename}", _external=True)
