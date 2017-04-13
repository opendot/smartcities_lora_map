/**
 * Created by Cento on 13/04/2017.
 */

angular.module('cityai')
    .factory('apiService', function ($q, $http) {

            return {

                getFile : function(url){
                    var deferred = $q.defer();
                    $http.get(url).success(function(data){
                        deferred.resolve(data);
                    }).error(function(){
                        console.log("error");

                        deferred.reject("An error occured while fetching file");
                    });

                    return deferred.promise;
                }
            }
    });