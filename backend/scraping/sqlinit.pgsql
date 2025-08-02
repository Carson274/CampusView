drop table rest_reviews;
drop table restaurants;
drop table users;

create table
    users (
        user_id SERIAL primary key,
        email varchar(255) not null,
        hashed_password varchar(255) not null
    );

create table
    restaurants (
        rest_id int primary key,
        name varchar(255) not null,
        description text not null,
        rating int,
        address varchar(255) not null,
        menu_url varchar(255) not null,
        details_url varchar(255) not null,
        img_url varchar(255),
        times jsonb,
        menus jsonb
    );

create table
    rest_reviews (
        review_id SERIAL primary key,
        user_id int references users (user_id) on delete cascade,
        rest_id int references restaurants (rest_id) on delete cascade,
        rating int not null,
        review_text text
    );