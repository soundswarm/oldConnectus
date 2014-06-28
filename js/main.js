var Connectus = {

  init: function() {

    //$('#createRepo, #addUser, #listRepos').hide();
    //oauth.io authentication
    OAuth.initialize('vMLd_AIdnpZtRPRH61n9z4j8RS8', {cache: true});

    if(OAuth.create('github')) {
      $('.signIn').hide();
      $('#createRepo, #addUser, #listRepos').fadeIn();
      this.doEverything();
    } else {
      $('.signIn').fadeIn();
      $('#createRepo, #addUser, #listRepos').hide();
      $('.signIn').on('click', this.doEverything );
    }

  },

  doEverything: function() {
    OAuth.popup('github', {cache: true}, function(error, result) {
      //handle error with error
      //use result.access_token in your API request
      $('.signIn').hide();
      $('#createRepo, #addUser, #listRepos').fadeIn();

      //urls used in API calls
      var apiUrl = "https://api.github.com";
      var tokenUrl ='?access_token='+result.access_token;
      var userUrl = apiUrl+'/user'+tokenUrl;
      var authRepoUrl = apiUrl+'/user/repos'+tokenUrl
              
      //display a string on the page
      function display(object) {
        $('.repos').hide().html(object).fadeIn();
      };

      //get authenticated repos
      function getRepos(callback) {
        $.ajax({
          url: authRepoUrl,
          type: 'GET',
          data: {'sort': 'updated'},
          success: function(repos) {
            console.log(repos);
            callback(repos);
          }
        });
      }

      function displayRepos(repos) {
        reposHtml ="";
        for(var i=0; i<repos.length; i++) {
          reposHtml+= '<div class="list-group-item"> <a href='+repos[i].html_url+' class="btn btn-primary">'+repos[i].name+ '</a> <label class="btn btn-primary"> <input type="checkbox" id='+ repos[i].name+'> Add collaborator </label></div>';
        }
        $('.repos').hide().html(reposHtml).fadeIn();
      };

      getRepos(displayRepos);

      //when create button is clicked, create a new repo and display it
      $(".create").on('click', function() {
        event.preventDefault();
        $.ajax(authRepoUrl, {
          type: 'POST',
          data: JSON.stringify({
            "name": $('.repoName').val()
          }),
          success: function(result) {
            //format the new repo into buttons/links and checkboxes
            $('.repos').prepend('<div class="list-group-item"> <a href='+result.html_url+' class="btn btn-primary">'+result.name+ '</a> <label class="btn btn-primary"> <input type="checkbox" id='+ result.name+'> add collaborator </label></div>');
          }
        });
      });

      //get user that's authenticated/logged in
      function getAuthUser(callback) {
        $.ajax({
          url: userUrl,
          type: 'GET',
          success: function(result) {
            callback(result);
          }
        });
      };

      function getCollaborators(callback) {
        for(var i=0;i<repos.length;i++) {
          $.ajax({
            url: apiUrl+'/repos/'+user+repos[i],
            type: 'GET',
            success: function(result) {
              callback(result);
            }
          });
        };
      };

      //add collaborator to repo(s) function
      function addCollaborator(userAdded, repo) {
        $.get(userUrl, function(user) {
          var addUserUrl = apiUrl+'/repos/'+user.login+'/'+repo+'/collaborators/'+userAdded+tokenUrl;
          $.ajax({
            url: addUserUrl,
            type: 'PUT',
            success:  function(response) {
              //get new collaborator's gravatar from github
              $.get(apiUrl+'/users/'+userAdded, function(response) {
                $('#'+repo).closest('.list-group-item').children('img').hide();
                $('#'+repo).closest('.list-group-item').append('<img src='+response.avatar_url+' class="img-responsive img-circle" alt="user added">');
              });
            }
          });
        });
      };

      //when add button is clicked, add new user to repos
      $('.add').on('click', function() {
        event.preventDefault();
        var repos = $("input[type=checkbox]:checked");
        if(repos.length == 0) {
          $('.error').hide();
          $('#userName').append('<div class="error">check the repos to which you want to add a user</div>').fadeIn();
        } else {
          for(var i=0; i<repos.length; i++) {
            $('.error').hide();
            addCollaborator($('.userName').val(), repos[i].id);
          }
        }
      });

    });
  }

}

$(document).ready( function () {
  Connectus.init();
});
