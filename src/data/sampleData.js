import { generateId } from '../utils/helpers';
import dayjs from 'dayjs';

// Örnek danışanlar
export const sampleClients = [
    {
        id: generateId(),
        firstName: 'Ayşe',
        lastName: 'Yılmaz',
        phone: '0532 111 2233',
        email: 'ayse@email.com',
        birthDate: '1990-05-15',
        gender: 'Kadın',
        emergencyContact: 'Ali Yılmaz - 0533 444 5566',
        notes: 'Anksiyete bozukluğu tedavisi devam ediyor.',
        diagnosis: 'Yaygın Anksiyete Bozukluğu',
        treatmentPlan: 'KDT (Kognitif Davranışçı Terapi) - 12 seans planlandı',
        createdAt: dayjs().subtract(30, 'day').toISOString(),
        isActive: true,
    },
    {
        id: generateId(),
        firstName: 'Mehmet',
        lastName: 'Demir',
        phone: '0541 222 3344',
        email: 'mehmet@email.com',
        birthDate: '1985-11-20',
        gender: 'Erkek',
        emergencyContact: 'Fatma Demir - 0542 555 6677',
        notes: 'İş stresi ve tükenmişlik sendromu.',
        diagnosis: 'Tükenmişlik Sendromu',
        treatmentPlan: 'Destekleyici psikoterapi + stres yönetimi teknikleri',
        createdAt: dayjs().subtract(15, 'day').toISOString(),
        isActive: true,
    },
    {
        id: generateId(),
        firstName: 'Zeynep',
        lastName: 'Kara',
        phone: '0555 333 4455',
        email: 'zeynep@email.com',
        birthDate: '1998-03-10',
        gender: 'Kadın',
        emergencyContact: 'Hasan Kara - 0556 777 8899',
        notes: 'Üniversite son sınıf, sınav kaygısı.',
        diagnosis: 'Sınav Kaygısı',
        treatmentPlan: 'KDT + gevşeme teknikleri eğitimi',
        createdAt: dayjs().subtract(7, 'day').toISOString(),
        isActive: true,
    },
];

// Örnek seanslar oluştur
export const generateSampleSessions = (clients) => {
    const sessions = [];

    if (clients.length >= 3) {
        // Ayşe için geçmiş seanslar
        sessions.push(
            {
                id: generateId(),
                clientId: clients[0].id,
                date: dayjs().subtract(7, 'day').hour(10).minute(0).toISOString(),
                duration: 50,
                status: 'completed',
                fee: 1500,
                paymentStatus: 'paid',
                mood: 3,
                notes: 'İlk seans. Danışan anksiyete belirtilerini anlattı. Tetikleyiciler belirlendi.',
                homework: 'Günlük kaygı günlüğü tutma',
            },
            {
                id: generateId(),
                clientId: clients[0].id,
                date: dayjs().subtract(1, 'day').hour(10).minute(0).toISOString(),
                duration: 50,
                status: 'completed',
                fee: 1500,
                paymentStatus: 'paid',
                mood: 4,
                notes: 'Kaygı günlüğü gözden geçirildi. Bilişsel yeniden yapılandırma çalışıldı.',
                homework: 'Düşünce kaydı formu doldurmak',
            }
        );

        // Bugünkü randevular
        sessions.push(
            {
                id: generateId(),
                clientId: clients[1].id,
                date: dayjs().hour(11).minute(0).toISOString(),
                duration: 50,
                status: 'scheduled',
                fee: 1500,
                paymentStatus: 'pending',
                mood: null,
                notes: '',
                homework: '',
            },
            {
                id: generateId(),
                clientId: clients[2].id,
                date: dayjs().hour(14).minute(0).toISOString(),
                duration: 50,
                status: 'scheduled',
                fee: 1500,
                paymentStatus: 'pending',
                mood: null,
                notes: '',
                homework: '',
            }
        );

        // Gelecek randevular
        sessions.push(
            {
                id: generateId(),
                clientId: clients[0].id,
                date: dayjs().add(7, 'day').hour(10).minute(0).toISOString(),
                duration: 50,
                status: 'scheduled',
                fee: 1500,
                paymentStatus: 'pending',
                mood: null,
                notes: '',
                homework: '',
            },
            {
                id: generateId(),
                clientId: clients[1].id,
                date: dayjs().add(3, 'day').hour(11).minute(0).toISOString(),
                duration: 50,
                status: 'scheduled',
                fee: 1500,
                paymentStatus: 'pending',
                mood: null,
                notes: '',
                homework: '',
            }
        );
    }

    return sessions;
};
