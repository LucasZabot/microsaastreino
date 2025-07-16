import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WorkoutCardProps } from '../types';

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  isFavorite = false,
  onFavoritePress,
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return '#10b981';
      case 'INTERMEDIATE':
        return '#f59e0b';
      case 'ADVANCED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CARDIO':
        return 'directions-run';
      case 'STRENGTH':
        return 'fitness-center';
      case 'FLEXIBILITY':
        return 'self-improvement';
      case 'HIIT':
        return 'flash-on';
      case 'YOGA':
        return 'spa';
      case 'PILATES':
        return 'accessibility';
      default:
        return 'fitness-center';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {workout.imageUrl ? (
          <Image source={{ uri: workout.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name={getCategoryIcon(workout.category)} size={32} color="#9ca3af" />
          </View>
        )}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={onFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              color={isFavorite ? '#ef4444' : '#ffffff'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {workout.name}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {workout.description}
        </Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Icon name="schedule" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{workout.duration}min</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Icon name="fitness-center" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{workout.exercises.length} exercícios</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(workout.difficulty) }]}>
            <Text style={styles.difficultyText}>
              {workout.difficulty === 'BEGINNER' ? 'Iniciante' : 
               workout.difficulty === 'INTERMEDIATE' ? 'Intermediário' : 'Avançado'}
            </Text>
          </View>
          
          <View style={styles.categoryBadge}>
            <Icon name={getCategoryIcon(workout.category)} size={14} color="#6366f1" />
            <Text style={styles.categoryText}>{workout.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 4,
  },
});

export default WorkoutCard;