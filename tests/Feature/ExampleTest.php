<?php

test('the root url redirects guests to the login page', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect(route('login'));
});
