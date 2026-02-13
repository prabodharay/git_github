import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'booking_list_screen.dart';
import 'customer_booking_screen.dart';

class CustomerHomeScreen extends StatefulWidget {
  final ApiService apiService;

  const CustomerHomeScreen({super.key, required this.apiService});

  @override
  State<CustomerHomeScreen> createState() => _CustomerHomeScreenState();
}

class _CustomerHomeScreenState extends State<CustomerHomeScreen> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      CustomerBookingScreen(apiService: widget.apiService),
      BookingListScreen(apiService: widget.apiService),
    ];

    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (v) => setState(() => _index = v),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.add_box_outlined), label: 'Book'),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'History'),
        ],
      ),
    );
  }
}
