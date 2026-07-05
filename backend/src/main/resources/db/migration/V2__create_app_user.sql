CREATE TABLE app_user
(
    user_id       BIGINT       NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(190) NOT NULL,
    phone         VARCHAR(30)  NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,

    CONSTRAINT pk_app_user
        PRIMARY KEY (user_id),

    CONSTRAINT uk_app_user_email
        UNIQUE (email),

    CONSTRAINT chk_app_user_role
        CHECK (role IN ('USER', 'ADMIN'))
);