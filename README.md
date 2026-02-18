# BarkBase

BarkBase is a brand new platform for dog walking and sitting services!

For more information, check out our project's [Proposal.pdf](documents/Proposal.pdf).

## Group Members

This application was developed by:

-   Braedon Haensel
-   Matias Lupick
-   Jolene Tan

## ER Diagram

[BarkBase ER Diagram.pdf](documents/BarkBase%20ER%20Diagram.pdf).

## Relational Schema

[BarkBase Relational Schema.pdf](documents/BarkBase%20Relational%20Schema.pdf).

## Normalization Writeup

[Normalization Writeup.pdf](documents/Normalization%20Writeup.pdf).

## How to Run the Application

1. Clone the repository and then navigate into its root folder.

    ```bash
    git clone https://csgit.ucalgary.ca/braedon.haensel/barkbase.git
    ```

2. Create a `.env` file in the root of the repository using the starter template.

    ```bash
    cp .env.example .env
    ```

3. Populate the previously-created `.env` file as required by following the instructions in its comments.

4. Run the backend:

    1. Navigate into the `backend` directory at the root of the repository.

    2. Use [pip](https://pypi.org/project/pip/) to install the required python packages.

        ```bash
        pip install -r requirements.txt
        ```

    3. Run the backend. You should see a message such as "Running on http://127.0.0.1:5000".

        ```bash
        python src/app.py
        ```

    4. You can open the displayed backend URL to view our API documentation.

5. With the backend still running, run the frontend **in a separate terminal**:

    1. Navigate into the `frontend` directory at the root of the repository.

    2. Use [Node.js](https://nodejs.org/en) to install the required npm packages.

        ```bash
        npm install
        ```

    3. Run the frontend. You should see a message such as "Local: http://localhost:3000".

        - For a production environment:

            - Build the Next.js app for production.

                ```bash
                npm run build
                ```

            - Start the application in production mode.

                ```bash
                npm run start
                ```

        - For a development environment:

            - Start the application in development mode.

                ```bash
                npm run dev
                ```

    4. Open the displayed URL in your web browser. For example: http://localhost:3000.

## Default Users

| Email           | Password | Account Type     |
| --------------- | -------- | ---------------- |
| bob@gmail.com   | password | Owner            |
| alice@gmail.com | password | Service Provider |
