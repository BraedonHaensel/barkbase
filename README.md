# BarkBase

BarkBase is a brand new platform for dog walking and sitting services!

For more information, check out our project's [Proposal.pdf](documents/Proposal.pdf)

## Group Members

This application was developed by:

-   Braedon Haensel (30144363)
-   Matias Lupick (30216478)
-   Jolene Tan (30301991)

## ER Diagram

Use [draw.io](https://www.drawio.com/) to view our ER diagram: [BarkBase ER Diagram.draw.io](documents/BarkBase%20ER%20Diagram.drawio)

## Relational Schema

Use [draw.io](https://www.drawio.com/) to view our relational schema: [BarkBase Relational Schema.draw.io](documents/BarkBase%20Relational%20Schema.drawio)

## How to run the application

1. Clone the repository

    ```bash
    git clone https://csgit.ucalgary.ca/braedon.haensel/barkbase.git
    ```

2. Create a `.env` file in the root of the repository using the starter template

    ```bash
    cp .env.example .env
    ```

3. Populate the previously-created `.env` file as required by following the instructions in its comments.

4. Run the backend:

    1. Navigate into the `frontend` directory at the root of the repository

    2. Use [pip](https://pypi.org/project/pip/) to install the required python packages

        ```bash
        pip install -r < requirements.txt
        ```

    3. Run the backend. You should see a message such as "Running on http://127.0.0.1:5000"

        ```bash
        python src/app.py
        ```

5. With the backend still running, run the frontend **in a separate terminal**:

    1. Navigate into the `backend` directory at the root of the repository

    2. Use [Node.js](https://nodejs.org/en) to install the required npm packages

        ```bash
        npm install
        ```

    3. Run the frontend. You should see a message such as "Local: http://localhost:3000"

        ```bash
        npm run dev
        ```

    4. Open the displayed URL in your web browser. For example: http://localhost:3000
