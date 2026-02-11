class Booking {
  final String id;
  final String vehicleType;
  final String status;
  final double fare;
  final String createdAt;

  Booking({
    required this.id,
    required this.vehicleType,
    required this.status,
    required this.fare,
    required this.createdAt,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id']?.toString() ?? '',
      vehicleType: json['vehicleType']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      fare: (json['fare'] as num?)?.toDouble() ?? 0,
      createdAt: json['createdAt']?.toString() ?? '',
    );
  }
}
