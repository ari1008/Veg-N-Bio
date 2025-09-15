import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:dio/dio.dart';

import '../../model/ResourceType.dart';
import '../../model/Review.dart';
import '../../model/CreateReview.dart';
import '../../model/ReviewStats.dart';
import '../../model/PaginatedReviews.dart';
import '../../utils/dio_service.dart';
import 'review_data_source.dart';

class ApiReviewDataSource implements ReviewDataSource {
  late final Dio _dio;

  ApiReviewDataSource() {
    _dio = makeTheHeader();
  }

  @override
  Future<Review> createReview(CreateReview createReview) async {
    try {
      final response = await _dio.post(
        "${dotenv.env['BASE_URL']}/reviews",
        data: createReview.toJson(),
      );

      if (response.statusCode != 201) {
        final errorData = response.data;
        if (errorData is Map<String, dynamic> && errorData.containsKey('message')) {
          throw Exception(errorData['message']);
        }
        throw Exception("Erreur lors de la création de l'avis");
      }

      return Review.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 409) {
        throw Exception("Vous avez déjà laissé un avis pour cette ressource");
      } else if (e.response?.statusCode == 404) {
        throw Exception("Ressource non trouvée");
      } else if (e.response?.statusCode == 400) {
        final errorData = e.response?.data;
        if (errorData is Map<String, dynamic> && errorData.containsKey('message')) {
          throw Exception(errorData['message']);
        }
        throw Exception("Données invalides");
      }
      throw Exception("Erreur réseau: ${e.message}");
    } catch (e) {
      throw Exception("Erreur inattendue: $e");
    }
  }


  @override
  Future<PaginatedReviews> getReviews(
      ResourceType resourceType,
      String resourceId, {
        int page = 0,
        int size = 20,
      }) async {
    try {
      final response = await _dio.get(
        "${dotenv.env['BASE_URL']}/reviews/${resourceType.name}/$resourceId",
        queryParameters: {
          'page': page,
          'size': size,
        },
      );

      if (response.statusCode != 200) {
        throw Exception("Erreur lors de la récupération des avis");
      }

      return PaginatedReviews.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception("Ressource non trouvée");
      }
      throw Exception("Erreur réseau: ${e.message}");
    } catch (e) {
      throw Exception("Erreur inattendue: $e");
    }
  }

  @override
  Future<List<Review>> getAllReviews(
      ResourceType resourceType,
      String resourceId
      ) async {
    try {
      final response = await _dio.get(
        "${dotenv.env['BASE_URL']}/reviews/${resourceType.name}/$resourceId/all",
      );

      if (response.statusCode != 200) {
        throw Exception("Erreur lors de la récupération des avis");
      }

      final List<dynamic> jsonList = response.data;
      return jsonList.map((json) => Review.fromJson(json)).toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception("Ressource non trouvée");
      }
      throw Exception("Erreur réseau: ${e.message}");
    } catch (e) {
      throw Exception("Erreur inattendue: $e");
    }
  }

  @override
  Future<ReviewStats> getReviewStats(
      ResourceType resourceType,
      String resourceId
      ) async {
    try {
      final response = await _dio.get(
        "${dotenv.env['BASE_URL']}/reviews/${resourceType.name}/$resourceId/stats",
      );

      if (response.statusCode != 200) {
        throw Exception("Erreur lors de la récupération des statistiques");
      }

      return ReviewStats.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception("Ressource non trouvée");
      }
      throw Exception("Erreur réseau: ${e.message}");
    } catch (e) {
      throw Exception("Erreur inattendue: $e");
    }
  }

  @override
  Future<bool> userHasReviewed(
      String userId,
      ResourceType resourceType,
      String resourceId
      ) async {
    try {
      final response = await _dio.get(
        "${dotenv.env['BASE_URL']}/reviews/${resourceType.name}/$resourceId/user/$userId/exists",
      );

      if (response.statusCode != 200) {
        throw Exception("Erreur lors de la vérification");
      }

      return response.data['hasReviewed'] as bool;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        // Si la ressource n'existe pas, on considère que l'user n'a pas d'avis
        return false;
      }
      throw Exception("Erreur réseau: ${e.message}");
    } catch (e) {
      throw Exception("Erreur inattendue: $e");
    }
  }
}