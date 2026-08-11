package com.buslink.service;

import com.buslink.dtos.AuthRequestDto;
import com.buslink.dtos.AuthResponseDto;
import com.buslink.dtos.SignupRequestDto;
import com.buslink.dtos.UserProfileDto;

public interface AuthService {
	AuthResponseDto authenticateUser(AuthRequestDto authRequest);
	UserProfileDto registerUser(SignupRequestDto signupRequest);
}
