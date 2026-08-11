package com.buslink.service;

import com.buslink.dtos.UpdateProfileDto;
import com.buslink.dtos.UserProfileDto;

public interface UserService {
	UserProfileDto getUserProfile(Long userId);
	UserProfileDto updateUserProfile(Long userId, UpdateProfileDto updateDto);
}
