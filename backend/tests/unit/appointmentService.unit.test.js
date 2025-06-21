const { v4: uuidv4 } = require('uuid');
const { createAppointment, getAppointments, updateAppointment, deleteAppointment, getAppointmentById } = require('../../services/appointmentService');
const { Appointment, User, Patient } = require('../../models');
const { format, addDays, subDays, parse } = require('date-fns');
const { ptBR } = require('date-fns/locale');
jest.mock('../../models');

describe('Appointment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new appointment', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const futureDate = format(addDays(new Date(), 1), 'dd/MM/yyyy HH:mm', { locale: ptBR }); // Adicionado locale para consistência
    const parsedDate = parse(futureDate, 'dd/MM/yyyy HH:mm', new Date(), { locale: ptBR });
    const isoDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const data = {
      doctorId,
      patientId,
      date: futureDate, // Data de entrada no formato pt-BR
      type: 'return',
      insurance: false,
    };

    // Mock para User.findByPk retornar um médico
    User.findByPk.mockResolvedValue({ id: doctorId, role: 'doctor' });
    // Mock para Patient.findByPk retornar um paciente
    Patient.findByPk.mockResolvedValue({ id: patientId });
    // Mock para Appointment.findOne não encontrar conflitos
    Appointment.findOne.mockResolvedValue(null);

    // Mock para Appointment.create
    // O mockResolvedValue deve simular o objeto que o Sequelize.create retorna
    // que inclui o método toJSON()
    Appointment.create.mockResolvedValue({
      id: uuidv4(), // Adicionar um ID para o objeto mockado
      ...data,
      date: isoDate, // A data armazenada internamente seria ISO
      toJSON: () => ({
        id: uuidv4(),
        ...data,
        date: isoDate // toJSON deve retornar a data como seria no banco de dados (ISO)
      })
    });

    const result = await createAppointment(data);
    // O resultado esperado do serviço é com a data formatada em pt-BR
    expect(result.date).toBe(futureDate);
    expect(result.doctorId).toBe(doctorId);
    expect(result.patientId).toBe(patientId);
    expect(User.findByPk).toHaveBeenCalledWith(doctorId);
    expect(Patient.findByPk).toHaveBeenCalledWith(patientId);
    expect(Appointment.findOne).toHaveBeenCalledWith({
      where: {
        doctorId: doctorId,
        date: isoDate,
      },
    });
    expect(Appointment.create).toHaveBeenCalledWith(expect.objectContaining({
      doctorId,
      patientId,
      date: isoDate, // A data passada para create deve ser ISO
      type: 'return',
      insurance: false,
    }));
  });

  it('should throw error for invalid date format', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const data = {
      doctorId,
      patientId,
      date: 'invalid-date',
      type: 'return',
      insurance: false,
    };
    await expect(createAppointment(data)).rejects.toThrow('Formato de data inválido');
  });

  it('should throw error for past date', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const pastDate = format(subDays(new Date(), 1), 'dd/MM/yyyy HH:mm');
    const data = {
      doctorId,
      patientId,
      date: pastDate,
      type: 'return',
      insurance: false,
    };
    await expect(createAppointment(data)).rejects.toThrow('Data deve ser futura');
  });

  it('should throw error for invalid doctor', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const futureDate = format(addDays(new Date(), 1), 'dd/MM/yyyy HH:mm');
    const data = {
      doctorId,
      patientId,
      date: futureDate,
      type: 'return',
      insurance: false,
    };
    User.findByPk.mockResolvedValue(null);
    await expect(createAppointment(data)).rejects.toThrow('Médico não encontrado');
  });

  it('should throw error for non-doctor role', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const futureDate = format(addDays(new Date(), 1), 'dd/MM/yyyy HH:mm');
    const data = {
      doctorId,
      patientId,
      date: futureDate,
      type: 'return',
      insurance: false,
    };
    User.findByPk.mockResolvedValue({ id: doctorId, role: 'secretary' });
    Patient.findByPk.mockResolvedValue({ id: patientId });
    await expect(createAppointment(data)).rejects.toThrow('Médico não encontrado');
  });

  it('should throw error for invalid patient', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const futureDate = format(addDays(new Date(), 1), 'dd/MM/yyyy HH:mm');
    const data = {
      doctorId,
      patientId,
      date: futureDate,
      type: 'return',
      insurance: false,
    };
    User.findByPk.mockResolvedValue({ id: doctorId, role: 'doctor' });
    Patient.findByPk.mockResolvedValue(null);
    await expect(createAppointment(data)).rejects.toThrow('Paciente não encontrado');
  });

  it('should throw error for conflicting appointment', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const futureDate = format(addDays(new Date(), 1), 'dd/MM/yyyy HH:mm', { locale: ptBR }); // Adicionado locale
    const parsedDate = parse(futureDate, 'dd/MM/yyyy HH:mm', new Date(), { locale: ptBR });
    const isoDate = format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
    const data = {
      doctorId,
      patientId,
      date: futureDate,
      type: 'return',
      insurance: false,
    };
    User.findByPk.mockResolvedValue({ id: doctorId, role: 'doctor' }); // Médico encontrado
    Patient.findByPk.mockResolvedValue({ id: patientId }); // Paciente encontrado
    Appointment.findOne.mockResolvedValue({ id: uuidv4(), date: isoDate }); // Conflito encontrado
    await expect(createAppointment(data)).rejects.toThrow('Médico já está agendado neste horário');
  });

  it('should get appointments with filters', async () => {
    const futureDateObj = addDays(new Date(), 2);
    const futureDateFormatted = format(futureDateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    const isoDate = format(futureDateObj, "yyyy-MM-dd'T'HH:mm:ss'Z'"); // Data ISO para o mock toJSON

    const filters = { type: 'return' };

    Appointment.findAll.mockResolvedValue([
      {
        id: uuidv4(),
        type: 'return',
        date: futureDateObj, // A data interna do mock pode ser um objeto Date
        toJSON: () => ({
          id: uuidv4(),
          type: 'return',
          date: isoDate // toJSON deve retornar a data como seria no banco de dados (ISO)
        })
      }
    ]);
    const result = await getAppointments(filters);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('return');
    expect(result[0].date).toBe(futureDateFormatted); // Espera a data formatada
    expect(Appointment.findAll).toHaveBeenCalledWith({
      where: filters,
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
        { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      ],
    });
  });

  it('should get appointment by id', async () => {
    const appointmentId = uuidv4();
    const futureDate = format(addDays(new Date(), 1), 'dd/MM/yyyy HH:mm');
    const isoDate = format(parse(futureDate, 'dd/MM/yyyy HH:mm', new Date(), { locale: ptBR }), "yyyy-MM-dd'T'HH:mm:ss'Z'");
    Appointment.findByPk.mockResolvedValue({
      id: appointmentId,
      doctorId: uuidv4(),
      patientId: uuidv4(),
      date: isoDate,
      type: 'return',
      toJSON: () => ({
        id: appointmentId,
        doctorId: uuidv4(),
        patientId: uuidv4(),
        date: futureDate,
        type: 'return',
      }),
    });
    const result = await getAppointmentById(appointmentId);
    expect(result.date).toBe(futureDate);
    expect(result.id).toBe(appointmentId);
  });

  it('should throw error for non-existing appointment by id', async () => {
    const appointmentId = uuidv4();
    Appointment.findByPk.mockResolvedValue(null);
    await expect(getAppointmentById(appointmentId)).rejects.toThrow('Consulta não encontrada');
  });

  it('should update an appointment', async () => {
    const appointmentId = uuidv4();
    const originalDate = addDays(new Date(), 1);
    const originalIsoDate = format(originalDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const newFutureDate = addDays(new Date(), 2);
    const newFutureDateFormatted = format(newFutureDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    const newIsoDate = format(newFutureDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const updateData = {
      date: newFutureDateFormatted, // Nova data no formato pt-BR
      type: 'initial',
    };

    // Mock para a consulta inicial da appointment
    const mockAppointmentInstance = {
      id: appointmentId,
      doctorId: uuidv4(),
      patientId: uuidv4(),
      date: originalIsoDate, // Data inicial em ISO
      type: 'return',
      insurance: false,
      createdAt: new Date(),
      updatedAt: new Date(),

      // Simula o método update de uma instância do Sequelize
      update: jest.fn(async (dataToUpdate) => {
        // Retorna o objeto mockado com os dados atualizados
        return {
          ...mockAppointmentInstance, // Mantém as propriedades originais
          ...dataToUpdate, // Aplica as atualizações
          date: dataToUpdate.date || mockAppointmentInstance.date, // Garante que a data seja atualizada corretamente
          toJSON: () => ({ // toJSON do objeto atualizado
            ...mockAppointmentInstance,
            ...dataToUpdate,
            date: dataToUpdate.date || mockAppointmentInstance.date // toJSON deve retornar a data como seria no banco de dados (ISO)
          })
        };
      }),
      // Simula o método toJSON de uma instância do Sequelize
      toJSON: () => ({
        id: appointmentId,
        doctorId: mockAppointmentInstance.doctorId,
        patientId: mockAppointmentInstance.patientId,
        date: originalIsoDate, // toJSON inicial retorna a data original em ISO
        type: 'return',
        insurance: false,
        createdAt: mockAppointmentInstance.createdAt,
        updatedAt: mockAppointmentInstance.updatedAt,
      })
    };

    Appointment.findByPk.mockResolvedValue(mockAppointmentInstance);

    const result = await updateAppointment(appointmentId, updateData);

    expect(result.date).toBe(newFutureDateFormatted);
    expect(result.type).toBe('initial');
    expect(mockAppointmentInstance.update).toHaveBeenCalledWith(expect.objectContaining({
      date: newIsoDate, // Espera que a data no update seja ISO
      type: 'initial'
    }));
    expect(Appointment.findByPk).toHaveBeenCalledWith(appointmentId);
  });

  // ... (mantenha os testes existentes e as correções acima)

  // Novo teste: data no passado para criação
  it('should throw error for past date on create', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const pastDate = format(subDays(new Date(), 1), 'dd/MM/yyyy HH:mm', { locale: ptBR }); // Usar subDays
    const data = {
      doctorId,
      patientId,
      date: pastDate,
      type: 'initial',
      insurance: false,
    };
    User.findByPk.mockResolvedValue({ id: doctorId, role: 'doctor' });
    Patient.findByPk.mockResolvedValue({ id: patientId });
    await expect(createAppointment(data)).rejects.toThrow('Data deve ser futura');
  });

  // Novo teste: médico com role diferente de 'doctor'
  it('should throw error if user found is not a doctor', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const futureDate = format(addDays(new Date(), 1), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    const data = {
      doctorId,
      patientId,
      date: futureDate,
      type: 'return',
      insurance: false,
    };
    User.findByPk.mockResolvedValue({ id: doctorId, role: 'admin' }); // Mock com role diferente
    Patient.findByPk.mockResolvedValue({ id: patientId });
    await expect(createAppointment(data)).rejects.toThrow('Médico não encontrado');
  });

  // Novo teste: paciente não encontrado
  it('should throw error if patient not found', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const futureDate = format(addDays(new Date(), 1), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    const data = {
      doctorId,
      mPatientId: patientId, // Correção de digitação aqui
      date: futureDate,
      type: 'return',
      insurance: false,
    };
    User.findByPk.mockResolvedValue({ id: doctorId, role: 'doctor' });
    Patient.findByPk.mockResolvedValue(null); // Paciente não encontrado
    await expect(createAppointment(data)).rejects.toThrow('Paciente não encontrado');
  });

  // Novo teste: buscar agendamentos sem filtros
  it('should get all appointments without filters', async () => {
    const futureDate = addDays(new Date(), 3);
    const formattedDate = format(futureDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    const isoDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const mockAppointments = [
      {
        id: uuidv4(),
        type: 'initial',
        date: isoDate,
        doctorId: uuidv4(),
        patientId: uuidv4(),
        toJSON: () => ({
          id: uuidv4(),
          type: 'initial',
          date: isoDate,
          doctorId: uuidv4(),
          patientId: uuidv4()
        })
      },
      {
        id: uuidv4(),
        type: 'return',
        date: isoDate,
        doctorId: uuidv4(),
        patientId: uuidv4(),
        toJSON: () => ({
          id: uuidv4(),
          type: 'return',
          date: isoDate,
          doctorId: uuidv4(),
          patientId: uuidv4()
        })
      },
    ];
    Appointment.findAll.mockResolvedValue(mockAppointments);

    const result = await getAppointments({}); // Sem filtros
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe(formattedDate);
    expect(result[1].date).toBe(formattedDate);
    expect(Appointment.findAll).toHaveBeenCalledWith({
      where: {},
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
        { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      ],
    });
  });

  // Novo teste: buscar agendamentos por doctorId e patientId
  it('should get appointments by doctorId and patientId', async () => {
    const doctorId = uuidv4();
    const patientId = uuidv4();
    const futureDate = addDays(new Date(), 4);
    const formattedDate = format(futureDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    const isoDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const filters = { doctorId, patientId };
    const mockAppointment = {
      id: uuidv4(),
      type: 'initial',
      date: isoDate,
      doctorId,
      patientId,
      toJSON: () => ({
        id: uuidv4(),
        type: 'initial',
        date: isoDate,
        doctorId,
        patientId,
      })
    };
    Appointment.findAll.mockResolvedValue([mockAppointment]);

    const result = await getAppointments(filters);
    expect(result).toHaveLength(1);
    expect(result[0].doctorId).toBe(doctorId);
    expect(result[0].patientId).toBe(patientId);
    expect(result[0].date).toBe(formattedDate);
    expect(Appointment.findAll).toHaveBeenCalledWith({
      where: filters,
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
        { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      ],
    });
  });

  // Novo teste: obter agendamento por ID
  it('should get appointment by id', async () => {
    const appointmentId = uuidv4();
    const futureDate = addDays(new Date(), 5);
    const formattedDate = format(futureDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    const isoDate = format(futureDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");

    const mockAppointment = {
      id: appointmentId,
      type: 'initial',
      date: isoDate,
      doctorId: uuidv4(),
      patientId: uuidv4(),
      toJSON: () => ({
        id: appointmentId,
        type: 'initial',
        date: isoDate,
        doctorId: uuidv4(),
        patientId: uuidv4(),
      })
    };
    Appointment.findByPk.mockResolvedValue(mockAppointment);

    const result = await getAppointmentById(appointmentId);
    expect(result.id).toBe(appointmentId);
    expect(result.date).toBe(formattedDate);
    expect(Appointment.findByPk).toHaveBeenCalledWith(appointmentId, {
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
        { model: Patient, as: 'patient', attributes: ['id', 'name'] },
      ],
    });
  });

  // Novo teste: throw NotFoundError when getting appointment by non-existent ID
  it('should throw NotFoundError when getting appointment by non-existent ID', async () => {
    Appointment.findByPk.mockResolvedValue(null);
    await expect(getAppointmentById(uuidv4())).rejects.toThrow('Consulta não encontrada');
  });

  // Novo teste: atualizar agendamento com data no passado
  it('should throw error for past date on update', async () => {
    const appointmentId = uuidv4();
    const pastDate = format(subDays(new Date(), 1), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    const updateData = { date: pastDate };

    const mockAppointmentInstance = {
      id: appointmentId,
      doctorId: uuidv4(),
      patientId: uuidv4(),
      date: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      type: 'return',
      toJSON: () => ({}), // toJSON para o objeto inicial
      update: jest.fn()
    };

    Appointment.findByPk.mockResolvedValue(mockAppointmentInstance);
    await expect(updateAppointment(appointmentId, updateData)).rejects.toThrow('Data deve ser futura');
    expect(mockAppointmentInstance.update).not.toHaveBeenCalled(); // Não deve tentar atualizar
  });

  // Novo teste: atualizar agendamento com formato de data inválido
  it('should throw error for invalid date format on update', async () => {
    const appointmentId = uuidv4();
    const invalidDate = 'invalid-date-format';
    const updateData = { date: invalidDate };

    const mockAppointmentInstance = {
      id: appointmentId,
      doctorId: uuidv4(),
      patientId: uuidv4(),
      date: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      type: 'return',
      toJSON: () => ({}), // toJSON para o objeto inicial
      update: jest.fn()
    };

    Appointment.findByPk.mockResolvedValue(mockAppointmentInstance);
    await expect(updateAppointment(appointmentId, updateData)).rejects.toThrow('Formato de data inválido');
    expect(mockAppointmentInstance.update).not.toHaveBeenCalled(); // Não deve tentar atualizar
  });

  // Novo teste: throw NotFoundError when updating non-existent appointment
  it('should throw NotFoundError when updating non-existent appointment', async () => {
    Appointment.findByPk.mockResolvedValue(null);
    await expect(updateAppointment(uuidv4(), {})).rejects.toThrow('Consulta não encontrada');
  });

  // Novo teste: throw NotFoundError when deleting non-existent appointment
  it('should throw NotFoundError when deleting non-existent appointment', async () => {
    Appointment.findByPk.mockResolvedValue(null);
    await expect(deleteAppointment(uuidv4())).rejects.toThrow('Consulta não encontrada');
  });

  it('should throw error for updating non-existing appointment', async () => {
    const appointmentId = uuidv4();
    const futureDate = format(addDays(new Date(), 2), 'dd/MM/yyyy HH:mm');
    const data = { date: futureDate, type: 'initial' };
    Appointment.findByPk.mockResolvedValue(null);
    await expect(updateAppointment(appointmentId, data)).rejects.toThrow('Consulta não encontrada');
  });

  it('should delete an appointment', async () => {
    const appointmentId = uuidv4();
    const appointment = {
      id: appointmentId,
      destroy: jest.fn().mockResolvedValue(),
    };
    Appointment.findByPk.mockResolvedValue(appointment);
    await deleteAppointment(appointmentId);
    expect(appointment.destroy).toHaveBeenCalled();
  });

  it('should throw error for deleting non-existing appointment', async () => {
    const appointmentId = uuidv4();
    Appointment.findByPk.mockResolvedValue(null);
    await expect(deleteAppointment(appointmentId)).rejects.toThrow('Consulta não encontrada');
  });
});

