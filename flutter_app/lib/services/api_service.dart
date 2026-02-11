import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../models/booking.dart';

class ApiService {
  String? _accessToken;

  void setAccessToken(String token) {
    _accessToken = token;
  }

  Map<String, String> _headers() {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (_accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    return headers;
  }

  Future<Map<String, dynamic>> sendOtp({
    required String phoneNumber,
    required String recaptchaToken,
    required String role,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}/auth/signup-phone'),
      headers: _headers(),
      body: jsonEncode({
        'phoneNumber': phoneNumber,
        'recaptchaToken': recaptchaToken,
        'role': role,
      }),
    );

    return _decode(response);
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String sessionInfo,
    required String otpCode,
    required String role,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}/auth/verify-otp'),
      headers: _headers(),
      body: jsonEncode({
        'sessionInfo': sessionInfo,
        'otpCode': otpCode,
        'role': role,
      }),
    );

    return _decode(response);
  }

  Future<Map<String, dynamic>> calculateFare({
    required String vehicleType,
    required double distanceKm,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}/pricing/fare/calculate'),
      headers: _headers(),
      body: jsonEncode({'vehicleType': vehicleType, 'distanceKm': distanceKm}),
    );

    return _decode(response);
  }

  Future<Map<String, dynamic>> createBooking({
    required Map<String, double> pickup,
    required Map<String, double> drop,
    required String vehicleType,
  }) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiBaseUrl}/bookings'),
      headers: _headers(),
      body: jsonEncode({
        'pickupLocation': pickup,
        'dropLocation': drop,
        'vehicleType': vehicleType,
      }),
    );

    return _decode(response);
  }

  Future<List<Booking>> getBookings() async {
    final response = await http.get(
      Uri.parse('${AppConfig.apiBaseUrl}/bookings'),
      headers: _headers(),
    );

    final body = _decode(response);
    final items = (body['data']?['bookings'] as List<dynamic>? ?? []);
    return items.map((e) => Booking.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> updateBookingStatus({
    required String bookingId,
    required String status,
  }) async {
    final response = await http.patch(
      Uri.parse('${AppConfig.apiBaseUrl}/bookings/$bookingId/status'),
      headers: _headers(),
      body: jsonEncode({'status': status}),
    );

    return _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    final decoded = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 400 || decoded['success'] == false) {
      final message = decoded['error']?['message']?.toString() ?? 'Request failed';
      throw Exception(message);
    }

    return decoded;
  }
}
