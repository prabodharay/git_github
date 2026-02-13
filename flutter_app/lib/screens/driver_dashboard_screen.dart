import 'package:flutter/material.dart';
import '../models/booking.dart';
import '../services/api_service.dart';

class DriverDashboardScreen extends StatefulWidget {
  final ApiService apiService;

  const DriverDashboardScreen({super.key, required this.apiService});

  @override
  State<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends State<DriverDashboardScreen> {
  bool _loading = true;
  String _error = '';
  List<Booking> _bookings = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final bookings = await widget.apiService.getBookings();
      setState(() => _bookings = bookings);
    } catch (e) {
      _error = e.toString();
    }
    setState(() => _loading = false);
  }

  Future<void> _updateStatus(String bookingId, String status) async {
    try {
      await widget.apiService.updateBookingStatus(bookingId: bookingId, status: status);
      await _load();
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Driver Dashboard')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                if (_error.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: Text(_error, style: const TextStyle(color: Colors.red)),
                  ),
                Expanded(
                  child: ListView.builder(
                    itemCount: _bookings.length,
                    itemBuilder: (context, index) {
                      final booking = _bookings[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Booking #${booking.id}'),
                              Text('Status: ${booking.status}'),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                children: ['accepted', 'arrived', 'started', 'completed']
                                    .map((s) => OutlinedButton(
                                          onPressed: () => _updateStatus(booking.id, s),
                                          child: Text(s),
                                        ))
                                    .toList(),
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                )
              ],
            ),
    );
  }
}
