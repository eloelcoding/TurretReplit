"""Generate a laser sound effect using audio synthesis."""
import numpy as np
from scipy.io import wavfile
from pathlib import Path

def generate_laser_sound(
    duration: float = 0.3,
    sample_rate: int = 44100,
    start_freq: float = 1500,
    end_freq: float = 200,
    output_path: str = "laser.wav"
):
    """
    Generate a classic laser 'pew' sound using a descending frequency sweep.
    
    Args:
        duration: Length of the sound in seconds
        sample_rate: Audio sample rate
        start_freq: Starting frequency in Hz (high pitch)
        end_freq: Ending frequency in Hz (low pitch)
        output_path: Where to save the WAV file
    """
    # Time array
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    
    # Exponential frequency sweep (sounds more natural than linear)
    freq = start_freq * (end_freq / start_freq) ** (t / duration)
    
    # Generate the phase (integral of frequency)
    phase = 2 * np.pi * np.cumsum(freq) / sample_rate
    
    # Generate sine wave with the sweeping frequency
    wave = np.sin(phase)
    
    # Add some harmonics for a richer sound
    wave += 0.3 * np.sin(2 * phase)  # 2nd harmonic
    wave += 0.15 * np.sin(3 * phase)  # 3rd harmonic
    
    # Amplitude envelope: quick attack, exponential decay
    attack_time = 0.01
    attack_samples = int(attack_time * sample_rate)
    envelope = np.ones_like(t)
    
    # Quick attack
    envelope[:attack_samples] = np.linspace(0, 1, attack_samples)
    
    # Exponential decay
    decay = np.exp(-3 * t / duration)
    envelope *= decay
    
    # Apply envelope
    wave *= envelope
    
    # Normalize to 16-bit range
    wave = wave / np.max(np.abs(wave))
    wave = (wave * 32767).astype(np.int16)
    
    # Save as WAV
    wavfile.write(output_path, sample_rate, wave)
    print(f"Generated laser sound: {output_path}")
    return output_path


if __name__ == "__main__":
    # Generate to the assets/sounds folder
    project_root = Path(__file__).parent.parent
    output = project_root / "assets" / "sounds" / "laser-synth.wav"
    generate_laser_sound(output_path=str(output))

