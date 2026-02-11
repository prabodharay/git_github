import 'package:flutter/material.dart';
import '../services/api_service.dart';

class CustomerBookingScreen extends StatefulWidget {
  final ApiService apiService;

  const CustomerBookingScreen({super.key, required this.apiService});

  @override
  State<CustomerBookingScreen> createState() => _CustomerBookingScreenState();
}

class _CustomerBookingScreenState extends State<CustomerBookingScreen> {
  final _pickupLat = TextEditingController(text: '19.0760');
  final _pickupLng = TextEditingController(text: '72.8777');
  final _dropLat = TextEditingController(text: '19.2183');
  final _dropLng = TextEditingController(text: '72.9781');

  String _vehicleType = 'mini_truck';
  String _farePreview = '-';
  String _status = '';
  bool _loading = false;

  Future<void> _previewFare() async {
    setState(() {
      _loading = true;
      _status = '';
    });

    try {
      final pickup = {
        'lat': double.parse(_pickupLat.text),
        'lng': double.parse(_pickupLng.text),
      };
      final drop = {
        'lat': double.parse(_dropLat.text),
        'lng': double.parse(_dropLng.text),
      };

      final dx = (pickup['lat']! - drop['lat']!).abs();
      final dy = (pickup['lng']! - drop['lng']!).abs();
      final distanceKm = ((dx + dy) * 111);

      final response = await widget.apiService.calculateFare(
        vehicleType: _vehicleType,
        distanceKm: distanceKm,
      );

      setState(() {
        _farePreview = response['data']?['fare']?.toString() ?? 'N/A';
      });
    } catch (e) {
      _status = e.toString();
    }

    setState(() => _loading = false);
  }

  Future<void> _createBooking() async {
    setState(() {
      _loading = true;
      _status = '';
    });

    try {
      final response = await widget.apiService.createBooking(
        pickup: {
          'lat': double.parse(_pickupLat.text),
          'lng': double.parse(_pickupLng.text),
        },
        drop: {
          'lat': double.parse(_dropLat.text),
          'lng': double.parse(_dropLng.text),
        },
        vehicleType: _vehicleType,
      );

      _status = 'Booking created: ${response['data']?['id']}';
    } catch (e) {
      _status = e.toString();
    }

    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Booking')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(controller: _pickupLat, decoration: const InputDecoration(labelText: 'Pickup Lat')),
          TextField(controller: _pickupLng, decoration: const InputDecoration(labelText: 'Pickup Lng')),
          TextField(controller: _dropLat, decoration: const InputDecoration(labelText: 'Drop Lat')),
          TextField(controller: _dropLng, decoration: const InputDecoration(labelText: 'Drop Lng')),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _vehicleType,
            items: const [
              DropdownMenuItem(value: 'mini_truck', child: Text('Mini Truck')),
              DropdownMenuItem(value: 'pickup', child: Text('Pickup')),
              DropdownMenuItem(value: 'tempo', child: Text('Tempo')),
              DropdownMenuItem(value: 'truck', child: Text('Truck')),
            ],
            onChanged: (v) => setState(() => _vehicleType = v ?? 'mini_truck'),
            decoration: const InputDecoration(labelText: 'Vehicle Type'),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              title: const Text('Fare Preview'),
              subtitle: Text('₹ $_farePreview'),
              trailing: OutlinedButton(onPressed: _loading ? null : _previewFare, child: const Text('Preview')),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(onPressed: _loading ? null : _createBooking, child: const Text('Create Booking')),
          if (_status.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(_status),
            ),
        ],
      ),
    );
  }
}
