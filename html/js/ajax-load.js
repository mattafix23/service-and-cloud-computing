var url = 'http://localhost:3000';

// Ajax Requests fetching necessary data

function loadRestaurants(){
  var tempUrl = url + '/restaurants';
  $.ajax({
    url: tempUrl,
    type: 'GET',
    contentType: 'application/json',
    charset: 'utf-8'
  }).done(function(data){
    console.log('Restaurants have been loaded:');
    console.log(data);
    createRestaurants(data, '/restaurant-single.html');
  });
}

function login(){
  console.log('Trying to login');
  $('.error').empty();
  $.ajax({
    url: url + '/users/sign_in',
    type: 'POST',
    data: '{ "user": { "email": "' + $('#exampleInputEmail1').val() + '", "password": "' + $('#exampleInputPassword1').val() + '" } }',
    contentType: "application/json;  charset=utf-8",
    dataType: "json"
  }).done(function(data, text, response){
    console.log(data);
    $.cookie('jwt_token', response.getResponseHeader('Authorization'));
    console.log(response.getAllResponseHeaders());
    window.location = '/my-restaurants.html';
  }).fail(function(data, text, response){
    console.log('Error');
    console.log(data);
    console.log(data.responseJSON.error);
    $('.error').addClass('alert alert-danger');
    $('.error').text(data.responseJSON.error);
  });
}

function loadOwnRestaurants(){
  $.ajax({
    url: url + '/user/restaurants',
    type: 'GET',
    headers: {
      "Authorization": $.cookie('jwt_token')
    },
    contentType: 'application/json',
    charset: 'utf-8'
  }).done(function(data){
    createRestaurants(data, '/restaurant-single-logged-in.html');
  }).fail(function(data){
    window.location = "/login.html";
  });
}

function loadRestaurantDetails(){
  var restaurant_id = window.location.hash.substring(1);
  $.ajax({
    url: url + '/restaurants/' + restaurant_id,
    type: 'GET',
    contentType: 'application/json',
    charset: 'utf-8'
  }).done(function(data){
    updateRestaurantData(data);
  }).fail(function(data){
    redirectHome();
  });
}

function loadRestaurantMenuCategoriesWithItems(){
  var restaurant_id = window.location.hash.substring(1);
  $.ajax({
    url: url + '/restaurants/' + restaurant_id + '/menu/categories_with_items',
    type: 'GET',
    contentType: 'application/json',
    charset: 'utf-8'
  }).done(function(data){
    updateMenu(data);
  }).fail(function(data){
    redirectHome();
  });
}

function loadOwnRestaurantDetails(){
  var restaurant_id = window.location.hash.substring(1)
  $.ajax({
    url: url + '/restaurants/' + restaurant_id,
    type: 'GET',
    headers: {
      "Authorization": $.cookie('jwt_token')
    },
    contentType: 'application/json',
    charset: 'utf-8'
  }).done(function(data){
    updateRestaurantData(data);
  }).fail(function(data){
    redirectHome();
  });
}

function loadOwnRestaurantCategories(){
  var restaurant_id = window.location.hash.substring(1)
  $.ajax({
    url: url + '/restaurants/' + restaurant_id + '/menu/categories',
    type: 'GET',
    headers: {
      "Authorization": $.cookie('jwt_token')
    },
    contentType: 'application/json',
    charset: 'utf-8'
  }).done(function(data){
    updateRestaurantCategories(data);
  }).fail(function(data){
    redirectHome();
  });
}

function updateOwnCategoryName(){
  var restaurant_id = window.location.hash.substring(1)
  var category_id = $('#kategorie-bearbeiten-pop-up .category_id').val();
  console.log(restaurant_id + ', ' + category_id);
  $.ajax({
    url: url + '/restaurants/' + restaurant_id + '/menu/categories/' + category_id,
    type: 'PUT',
    headers: {
      "Authorization": $.cookie('jwt_token')
    },
    contentType: 'application/json',
    charset: 'utf-8',
    data: $('#kategorie-bearbeiten-pop-up form').serialize()
  }).done(function(data){
    console.log(data);
  }).fail(function(data){
    redirectHome();
  });
} 

// Manipulating DOM Elements

function createRestaurants(restaurants, link){
  console.log('Restaurants will be created:');
  console.log(restaurants);
  var chunks = [];
  while(restaurants.length){
    chunks.push(restaurants.splice(0,4));
  }
  for(var i = 0; i < chunks.length; i++){
    var htmlElement = '<div class="row no-gutter">';
    for(var j = 0; j < chunks[i].length; j++){
      htmlElement += createRestaurant(chunks[i][j], link);
    }
    htmlElement += '</div>';
    $('.content').empty();
    $('.content').append(htmlElement);
  }
}

function createRestaurant(restaurant, link){
  return '<div class="col-12 col-lg-3 mc-restaurant" style="background-image: url(' + url + restaurant.image_url_small + ');">' +
  '<a href="' + link + '#' + restaurant.id + '">' +
  '<div class="restaurant-details-box">' +
  '<div class="restaurant-details-text text-left">' +
  '<h2><strong>' + restaurant.name + '</strong></h2>' +
  '<h4>' + restaurant.address + '</h4>' +
  '</div></div></a></div>';
}

function updateRestaurantData(restaurant){
  $('title').text(restaurant.name);
  $('.navbar h1').text(restaurant.name);
  $('.restaurant-details a.website').text(restaurant.name);
  $('.restaurant-details a.website').attr('href', restaurant.website);
  $('.restaurant-details p').text(restaurant.address);
  $('.restaurant-details p').text(restaurant.address);
  $('.restaurant-details a.phone').text(restaurant.phone);
  $('.restaurant-details a.phone').attr('href', 'tel:' + restaurant.phone);
  $('.mc-restaurant-single-bg').css('background-image', 'url("' + url + restaurant.image_url_large + '")')
}

function updateMenu(categories){
  $('.menu-container').empty();
  var htmlElement = '<div id="accordion">';
  for(var i = 0; i < categories.length; i++){
    var categorie = categories[i];
    htmlElement += '<div class="card ' + (i % 2 === 0 ? 'kategorie-hell' : 'kategorie-dunkel') + '"><div class="card-header" id="headingOne">' +
      '<h3 class="mb-0"><button class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapse' + i + '" aria-expanded="false" aria-controls="collapse' + i + '">' +
      categorie.name +
      '</button></h3></div><div id="collapse' + i + '" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion"><div class="card-body">';
    for(var j = 0; j < categorie.items.length; j++){
      var item = categorie.items[j];
      htmlElement += createItem(item);
    }
    htmlElement += '</div></div></div>';
  }
  htmlElement += '</div>';
  $('.menu-container').append(htmlElement);
}

function createItem(item){
  return '<div class="row mc-single-item">' +
  '<div class="col-8 mc-speise-titel">' +
  '<p><strong>' + item.name + '</strong></p>' +
  '</div>' +
  '<div class="col-4 mc-speise-preis text-right">' +
  '<i><strong>' + item.price + 'EUR</strong></i>' +
  '</div>' +
  '<div class="col mc-speise-beschreibung">' +
  '<p>' + item.description + '</p>' +
  '</div>' +
  '</div>'
}

function updateRestaurantCategories(categories){
  $('.categorie-content .card-body').empty();
  var htmlElement = '';
  for(var i = 0; i < categories.length; i++){
    htmlElement += '<div class="row mc-category-list-item">' +
    '<div class="col-8">' +
    '<strong>' + categories[i].name + '</strong>' +
    '</div>' +
    '<div class="col-4 text-right">' +
    '<button class="mc-edit-small" type="button" data-toggle="modal" data-target="#kategorie-bearbeiten-pop-up" data-id="' + categories[i].id + '"><i class="fas fa-pen"></i></button>' +
    '<a href=""><i class="fas fa-trash-alt"></i></a>' +
    '</div>' +
    '</div>';
  }
  $('.categorie-content .card-body').append(htmlElement);
}

function redirectHome(){
  window.location = '/home.html';
}

$(document).ready(function(){
  $('#kategorie-bearbeiten-pop-up').on('show.bs.modal', function(event){
    var button = $(event.relatedTarget) // Button that triggered the modal
    console.log('Modal is displayed');
    var cat_id = button.data('id');
    console.log(cat_id);
    $('#kategorie-bearbeiten-pop-up .category_id').val(cat_id);
  });
});
