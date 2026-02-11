import 'package:flutter/material.dart';
import '../services/api_service.dart';

class LoginScreen extends StatefulWidget {
  final ApiService apiService;
  final void Function(String role) onLoggedIn;

  const LoginScreen({
    super.key,
    required this.apiService,
    required this.onLoggedIn,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController(text: '+91');
  final _captchaController = TextEditingController(text: 'test-recaptcha-token');
  final _sessionController = TextEditingController();
  final _otpController = TextEditingController();

  String _role = 'customer';
  bool _loading = false;
  String? _error;

  Future<void> _sendOtp() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await widget.apiService.sendOtp(
        phoneNumber: _phoneController.text.trim(),
        recaptchaToken: _captchaController.text.trim(),
        role: _role,
      );

      final sessionInfo = response['data']?['sessionInfo']?.toString() ?? '';
      _sessionController.text = sessionInfo;
    } catch (e) {
      _error = e.toString();
    }

    setState(() => _loading = false);
  }

  Future<void> _verifyOtp() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await widget.apiService.verifyOtp(
        sessionInfo: _sessionController.text.trim(),
        otpCode: _otpController.text.trim(),
        role: _role,
      );

      final token = response['data']?['tokens']?['accessToken']?.toString();
      if (token == null || token.isEmpty) {
        throw Exception('No access token in response');
      }

      widget.apiService.setAccessToken(token);
      widget.onLoggedIn(_role);
    } catch (e) {
      _error = e.toString();
    }

    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('LoadEx Login')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(_error!, style: const TextStyle(color: Colors.red)),
                ),
              TextField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Phone Number'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _role,
                items: const [
                  DropdownMenuItem(value: 'customer', child: Text('Customer')),
                  DropdownMenuItem(value: 'driver', child: Text('Driver')),
                  DropdownMenuItem(value: 'admin', child: Text('Admin')),
                ],
                onChanged: (value) => setState(() => _role = value ?? 'customer'),
                decoration: const InputDecoration(labelText: 'Role'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _captchaController,
                decoration: const InputDecoration(labelText: 'reCAPTCHA Token'),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _loading ? null : _sendOtp,
                child: const Text('Send OTP'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _sessionController,
                decoration: const InputDecoration(labelText: 'Session Info'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _otpController,
                decoration: const InputDecoration(labelText: 'OTP Code'),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _loading ? null : _verifyOtp,
                child: _loading
                    ? const CircularProgressIndicator()
                    : const Text('Verify OTP & Login'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
