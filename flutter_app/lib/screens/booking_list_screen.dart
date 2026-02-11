import 'package:flutter/material.dart';
import '../models/booking.dart';
import '../services/api_service.dart';

class BookingListScreen extends StatefulWidget {
  final ApiService apiService;

  const BookingListScreen({super.key, required this.apiService});

  @override
  State<BookingListScreen> createState() => _BookingListScreenState();
}

class _BookingListScreenState extends State<BookingListScreen> {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Booking List')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
              ? Center(child: Text(_error))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    itemCount: _bookings.length,
                    itemBuilder: (context, index) {
                      final booking = _bookings[index];
                      return ListTile(
                        title: Text('Booking #${booking.id}'),
                        subtitle: Text('${booking.vehicleType} • ₹${booking.fare}'),
                        trailing: Chip(label: Text(booking.status)),
                      );
                    },
                  ),
                ),
    );
  }
}
