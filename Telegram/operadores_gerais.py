# Script com conjunto de classes que operam com funcionalidades gerais

# Classe com funcionalidades sobre as datas
class operador_data():
    def __init__(self):
        # bibliotecas utilizadas
        import os, numpy, sys, datetime, shutil, pandas, functools
        self.os, self.np, self.sys, self.date, self.shutil, self.pd, self.functools = os, numpy, sys, datetime, shutil, pandas, functools
        self.meses_nomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        from os.path import join
        self.join = join
        import zipfile as zf
        self.zf = zf
        from pathlib import Path
        self.Path = Path
        # paths — derivado automaticamente: 0.CLASSES -> 0.SCRIPTS -> Middle
        # path_scripts é a raiz do projeto (qualquer que seja o nome da pasta).
        # path_middle é o pai do projeto (onde ficam 8.CREDENCIAIS, 1.ARQUIVOS, 2.DADOS, etc).
        self.path_scripts = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        self.path_middle = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        self.path_decks = join(self.path_middle, '1.ARQUIVOS', '1.DECKS')
        self.path_credenciais = join(self.path_middle, '8.CREDENCIAIS')
        #
        self.path_newave = join(self.path_middle, '2.DADOS', '3.MODELOS', '0.NEWAVE')
        self.path_decomp = join(self.path_middle, '2.DADOS', '3.MODELOS', '1.DECOMP')
        self.path_dessem = join(self.path_middle, '2.DADOS', '3.MODELOS', '2.DESSEM')
        self.path_gevazp = join(self.path_middle, '2.DADOS', '3.MODELOS', '3.GEVAZP')
        #
        self.path_newave_deck = self.join(self.path_middle, '1.ARQUIVOS', '1.DECKS', '0.NEWAVE')
        self.path_decomp_deck = self.join(self.path_middle, '1.ARQUIVOS', '1.DECKS', '1.DECOMP')
        self.path_dessem_deck = self.join(self.path_middle, '1.ARQUIVOS', '1.DECKS', '2.DESSEM')
        self.path_gevazp_deck = self.join(self.path_middle, '1.ARQUIVOS', '1.DECKS', '3.GEVAZP')
        #
        self.path_hidro  = join(self.path_middle, '2.DADOS', '0.HIDROLOGIA')
        # limites regulatórios de PLD
        self.path_limites_PLD =  join(self.path_middle, '3.REGULATORIO', '0.PLD', 'PLD_parametros.csv')
        #
        self.discret_ano = {
            'mes': [i + 1 for i in range(12)],
            'trimestres': [3*i + 1 for i in range(4)],
            'quadrimestre': [4*i + 1 for i in range(3)],
            'semestre': [6*i + 1 for i in range(2)]
        }
    
    # verifica se é string, se for, transformar em datetime
    def verifica_formato(self, data):
        if(type(data) == type('string')):
            if(len(data) == 6): data = self.date.datetime.strptime(data, "%Y%m").date()
            elif(len(data) == 8): data = self.date.datetime.strptime(data, "%Y%m%d").date()
        elif(type(data) == type(self.date.date(2000, 1, 1))): return data
        return data
    
    # mês anterior
    def mes_anterior(self, data):
        data = self.verifica_formato(data)
        mes, ano = data.month, data.year
        return self.date.date((ano - 1)*(mes == 1) +ano*(mes > 1), (mes - 1)*(mes> 1 ) + (12)*(mes == 1), 1)
    
    # próximo mês 
    def proximo_mes(self, data):
        ano, mes = data.year, data.month
        return self.date.date(ano*(mes < 12)+(ano + 1)*(mes == 12), (mes == 12)+(mes + 1)*(mes < 12), 1)
    
    # dia final do mês
    def mes_fim(self, data):
        data = self.proximo_mes(data) - self.date.timedelta(days = 1)
        return data
    
    # n-ésimo mês a frente
    def n_next_month(self, data, n):
        for i in range(n):
            data = self.proximo_mes(data)
        return data
    
    # números de meses de diferença entre uma data e outra
    def delta_mes(self, data_1, data_2):
        data_1 = self.date.date(data_1.year, data_1.month, 1)
        data_2 = self.date.date(data_2.year, data_2.month, 1)
        if(data_1 == data_2): return 0
        if(data_1 > data_2):
            data_1, data_2 = data_2, data_1
        contador = 0
        while(data_1 < data_2):
            data_1 = self.proximo_mes(data_1)
            contador += 1
        return contador
    
    # retorna início da semana operativa de uma data
    def rev_ini(self, data):
        data_rev = data - (self.date.timedelta(days = data.weekday() + 2))*(data.weekday() < 5) - (self.date.timedelta(days = data.weekday()-5))*(data.weekday()>= 5)
        return data_rev
        
    # retorna fim da semana operativa de uma data
    def rev_fim(self, data):
        data_rev = data + (self.date.timedelta(days = 4 - data.weekday()))*(data.weekday() < 5) + (self.date.timedelta(days = 11 - data.weekday()))*(data.weekday() >= 5)
        return data_rev
    
    # dá início da rev0 do mês referente a data
    def rev_0_data(self, data):
        data = self.verifica_formato(data)
        ano, mes = data.year, data.month
        data = self.date.date(ano, mes, 1)
        rev_0 = self.rev_ini(data)
        return rev_0
    
    # dá a data de início da n-ésima rev do mês referente a data
    def rev_n_data(self, data, n_rev):
        data = self.verifica_formato(data)
        rev0 = self.rev_0_data(data)
        rev = rev0 + self.date.timedelta(days = 7*n_rev)
        return rev
    
    # devolve data_mes (ano, mes, 1) da data
    def data_ano_mes(self, data):
        rev_fim = self.rev_fim(data)
        data = self.date.date(rev_fim.year, rev_fim.month, 1)
        return data
    
    # calcula número da rev de 'data'
    def numero_rev(self, data):
        ini_rev = self.rev_ini(data)
        fim_rev = self.rev_fim(data)
        inicio_mes = self.date.date(fim_rev.year, fim_rev.month, 1)
        rev_0_mes = self.rev_ini(inicio_mes)
        rev = 0
        while(ini_rev != (rev_0_mes + self.date.timedelta(days = 7*rev))):
            rev += 1
            if(rev >= 5): return None
        return rev
    
    # dá a data do início da próxima rev (entrada e saída são no formato datetime)
    def ini_proxima_rev(self, data):
        data_rev_ini = self.rev_ini(data)
        return data_rev_ini + self.date.timedelta(days = 7)
    
    # dá a data de fim da próxima rev
    def fim_proxima_rev(self, data):
        data_prox_rev = self.ini_proxima_rev(data)
        return self.rev_fim(data_prox_rev)
    
    # dá a data do início da n-ésima rev após a atual
    def ini_n_rev(self, data, n):
        data = self.verifica_formato(data)
        data_rev_ini = self.rev_ini(data)
        contador = 0
        while(contador < n):
            data_rev_ini += self.date.timedelta(days = 7)
            contador += 1
        return data_rev_ini
        
    # dá o número de revs no mês
    def numero_revs_mes(self, data):
        mes = data.month
        data = self.rev_ini(self.date.date(data.year, data.month, 1))
        numero_revs = 0
        while(self.rev_fim(data).month == mes):
          data += self.date.timedelta(days = 7)
          numero_revs += 1
        return numero_revs
    
    # o número de dias que a rev possui no mês
    def dias_rev_mes(self, data):
        data = self.verifica_formato(data)
        ini = self.rev_ini(data)
        fim = self.rev_fim(data)
        ret = {}
        for index in range(7):
            dia = ini + self.date.timedelta(days = index)
            key = dia.strftime("%Y%m")
            if(key not in ret): ret[key] = 0
            ret[key] += 1
        return ret
    
    # retorna lista informando número de dias em cada mês a partir de uma certa data, dado um número de semanas
    def dias_rev_mes_semanas(self, data, semanas, mes_alvo = None):
        if(mes_alvo is not None):
            mes_alvo = mes_alvo.strftime("%Y%m")
        data_mes = self.data_ano_mes(data)
        data_ini = self.rev_ini(data_mes)
        data_0 = self.verifica_formato(data)
        ret = []
        for i in range(semanas):
            data_semana = data_ini + self.date.timedelta(days = i*7)
            data_semana_mes = self.data_ano_mes(data_semana)
            dias_meses = self.dias_rev_mes(data_semana)
            if(mes_alvo is not None):
                if(mes_alvo in dias_meses):
                    ret.append(dias_meses[mes_alvo])
                else:
                    ret.append(0)
            else:
                ret.append(dias_meses)
        return ret
    
    # número de horas no mês
    def horas_mes(self, data):
        ano, mes = data.year, data.month
        data = self.date.date(ano, mes, 1)
        next_data = self.proximo_mes(data)
        return ((next_data - data).days + 1)*24

    # identifica o quadrimestre do ano ao qual pertence o mês (1, 2 ou 3)
    # Q1: Jan-Abr (meses 1-4), Q2: Mai-Ago (meses 5-8), Q3: Set-Dez (meses 9-12)
    def quadrimestre(self, data):
        data = self.verifica_formato(data)
        mes = data.month
        return (mes - 1) // 4 + 1

    # se data for string, transformar para data, caso contrário
    def data_string_to_date(self, data_string, formato_string = "%Y%m%d"):
        if(isinstance(data_string, str)):
            if((formato_string == "%Y%m%d")&(len(data_string) == 6)):
                formato_string = "%Y%m"
            data_date = self.date.datetime.strptime(data_string, formato_string).date()
        else:
            data_date = data_string
        return data_date
    
    # se data for date.date(), transformar para string, caso contrário
    def data_date_to_string(self, data_date, formato_string = "%Y%m%d"):
        if(isinstance(data_date, self.date.date)):
            data_string = data_date.strftime(formato_string)
        else:
            data_string = data_date
        return data_string
    
    # datas iniciais e finais dos estágios de um deck Decomp num dicionário do tipo estagios[5] = [data_1, data_2]
    def datas_estagios_decomp(self, ano, mes, rev):
        estagios = {}
        data_mes = self.date.date(ano, mes, 1)
        data_prox_mes = self.proximo_mes(data_mes)
        data = self.rev_ini(data_mes) + self.date.timedelta(days = 7*rev)
        i = 1
        while(data.month != data_prox_mes.month):
            estagios[i] = [data, self.rev_fim(data)]
            data += self.date.timedelta(days = 7)
            i += 1
        estagios[i] = [data, self.proximo_mes(data) - self.date.timedelta(days = 1)]
        return estagios
    
    # determina estágios de um deck decomp
    def horizonte_estagios_decomp(self, data_deck, rev):
        data_deck = self.data_string_to_date(data_deck, formato_string = "%Y%m")
        data_deck = self.data_ano_mes(data_deck)
        mes1 = self.n_next_month(data_deck, 1)
        mes2 = self.n_next_month(mes1, 1)
        ultimo_dia_mes1 = mes2 - self.date.timedelta(days = 1)
        data_ini = self.rev_ini(data_deck) + self.date.timedelta(days = 7*rev)
        estagios = {}
        est = 1
        data = self.rev_ini(data_ini)
        if(rev == 0):
            rev_fim = self.rev_fim(data)
            ini = data
            fim = rev_fim
            estagios[est] = [ini, fim]
            data += self.date.timedelta(days = 7)
            est += 1
        while(True):
            rev_fim = self.rev_fim(data)
            if(rev_fim.month != mes1.month):
                ini = data
                fim = rev_fim
                estagios[est] = [ini, fim]
            else:
                if(data.day != 1):
                    ini = data
                    fim = rev_fim
                    estagios[est] = [ini, fim]
                    est += 1
                    ini = fim + self.date.timedelta(days = 1)
                    fim = ultimo_dia_mes1
                    estagios[est] = [ini, fim]
                    break
                else:
                    fim = ultimo_dia_mes1
                    estagios[est] = [ini, fim]
                    break
            data += self.date.timedelta(days = 7)
            est += 1
        #
        list_estags = sorted(list(estagios.keys()))
        last_estag = list_estags[-1]
        last_semana = list_estags[-2]
        #
        estagios[last_estag][0] = estagios[last_semana][1] + self.date.timedelta(days = 1)
        #
        return estagios
    
    # interpretar dia inicial ou final de um estágio ou mês
    def ler_dia_estagio(self, modelo, data_deck, rev_deck, tempo, estagios, inicial):
        data_deck = self.data_string_to_date(data_deck, formato_string = "%Y%m")
        data_deck = self.data_ano_mes(data_deck)
        #
        if(modelo == 'DC'):
            mes_ini_rev = self.rev_ini(data_deck)
            data_ini = mes_ini_rev + self.date.timedelta(days = 7*rev_deck)
            estagios = self.horizonte_estagios_decomp(data_deck, rev_deck)
            est_f = sorted(list(estagios.keys()))[-1]
        else:
            data_ini = data_deck
        # mês relativo
        if('M' in tempo):
            mes = int(tempo[1:])
            data = self.n_next_month(data_deck, mes)
            if(inicial): return data
            data = self.n_next_month(data, 1) - self.date.timedelta(days = 1)
            return data
        # rev do mês do deck
        if('rv' in tempo):
            rv = int(tempo[2])
            data = self.rev_ini(data_ini) + self.date.timedelta(days = 7*rv) + int(inicial is False)*(self.date.timedelta(days = 6))
            return data
        # estágio ou mês relativo declarado
        elif(len(tempo) <= 2):
            est = int(tempo)
            if(modelo == 'DC'):
                est = max(min(est, est_f), 1)
                data = data_ini + self.date.timedelta(days = 7*(est - 1)) + int(inicial is False)*(self.date.timedelta(days = 6))
            else:
                mes = est
                data = self.n_next_month(data_deck, mes)
                if(inicial): return data
                data = self.n_next_month(data, 1) - self.date.timedelta(days = 1)
            return data
        # declarado para mês
        elif(len(tempo) == 6):
            data = self.data_string_to_date(str(tempo), formato_string = "%Y%m")
            if(inicial): return data
            data = self.n_next_month(data, 1) - self.date.timedelta(days = 1)
            return data
        # declarando para rev específica dentro de um mês
        elif('_' in tempo):
            spl = tempo.split('_')
            data, rv = spl[0], int(spl[1])
            data = self.data_string_to_date(data, formato_string = "%Y%m")
            data = self.rev_ini(data) + self.date.timedelta(days = 7*rv) + int(inicial is False)*(self.date.timedelta(days = 6))
            return data
        # declarando um dia exato
        elif(len(tempo) == 8):
            data = self.data_string_to_date(str(tempo), formato_string = "%Y%m%d")
            return data
    
    # Lê tabela de alterações de térmicas para decks NW e DC
    def aplicar_termicas_decks(self, path_pasta_caso, table, aba, data_base, modelo, data_deck, rev_deck, termicas = None, regras = None):
        # cadastro inicial de térmicas
        if(termicas is None):
            p_term = self.join(path_pasta_caso, 'term.dat')
            p_expt = self.join(path_pasta_caso, 'expt.dat')
            termicas = self.nw.term_expt_dict(p_term, p_expt, data_base)
        # tabela de regras de aplicações
        if(regras is None):
            p_table = self.join(path_pasta_caso, 'termicas.xlsx')
            table = self.pd.read_excel(p_table, sheet_name = aba, dtype = str)
            n, m = table.shape
            regras = table.values.tolist()
        # lê aplicações
        ambos = 'NWDC'
        n = len(regras)
        index = 0
        while(index < n):
            line = regras[index]
            modelo_index = line[0]
            if(modelo not in modelo_index):
                index += 1
                continue
            # Verificando validade de data do modelo
            if(ambos in modelo_index): jindex_data = 4
            else: jindex_data = 2
            if(len(modelo_index) >= jindex_data + 1):
                datas_deck_val = modelo_index[jindex_data:]
                spl = datas_deck_val.split('-')
                ini_deck = str(spl[0])
                ini = self.ler_dia_estagio('NW', data_deck, 0, ini_deck, None, True)
                ini_mes = self.opd.data_ano_mes(ini)
                if(data_deck < ini_mes):
                    index += 1
                    continue
                #
                if(len(spl) == 2):
                    fim_deck = str(spl[1])
                    #if(fim_deck )
                    fim = self.opd.ler_dia_estagio('NW', data_deck, 0, fim_deck, None, False)
                    fim_mes = self.opd.data_ano_mes(fim)
                    if(data_deck > fim_mes):
                        index += 1
                        continue
                else:
                    fim = self.opd.ler_dia_estagio('NW', data_deck, 0, ini_deck, None, False)
                    fim_mes = self.opd.data_ano_mes(fim)
                # Aplicar regra
                print(ini_mes, fim_mes)
                #
                
                # 
            index += 1
    
    # calcula sazonalidade de uma série em trechos variáveis dentro de um período
    def calcula_sazo_serie(self, valores, ini, periodo = 12, intervalos_discret = None, discret = 'mensal', period = 'anual', data_fixa = False):
        if(isinstance(valores, dict)):
            keys = sorted(list(valores.keys()))
            n = len(keys)
        else:
            n = len(valores)
            keys = [i for i in range(n)]
        periodo = min(n, periodo)
        datas = [self.n_next_month(ini, i) for i in range(periodo)]
        if(intervalos_discret is None): intervalos_discret = [i for i in range(periodo + 1)]
        #
        tamanho_intervalos = [0]*(len(intervalos_discret) - 1)
        valores_periodo = []
        med_intervalos = [0]*(len(intervalos_discret) - 1)
        med_periodo = 0
        if(discret == 'mensal'):
            ini = self.data_ano_mes(ini)
            #
            n = len(datas)
            for i in range(periodo):
                intervalo = None
                for j in range(len(intervalos_discret)):
                    ini_inter = intervalos_discret[j]
                    if(j + 1 >= len(intervalos_discret)):
                        fim_inter = intervalos_discret[-1]
                        break
                    else:
                        fim_inter = intervalos_discret[j+1]
                    if((i >= ini_inter)&(i < fim_inter)):
                        intervalo = j
                        break
                #
                data = self.n_next_month(ini, i)
                valor = int(round(float(valores[i]), 0))
                valores_periodo.append(valor)
                #
                tamanho = self.horas_mes(data)
                horas = self.horas_mes(data)
                tamanho_intervalos[intervalo] += horas
                med_intervalos[intervalo] += horas*valor
                med_periodo += valor*horas
        #
        for i in range(len(med_intervalos)):
            med_intervalos[i] = med_intervalos[i]/tamanho_intervalos[i]
        med_periodo = med_periodo/sum(tamanho_intervalos)
        #
        sazo = []
        for i in range(len(med_intervalos)):
            razao = med_intervalos[i]/med_periodo
            sazo.append(1 + (1 - razao))
        #
        ret = {
            'valores_periodo': valores_periodo,
            'valores_intervalos': med_intervalos,
            'tamanho_intervalos': tamanho_intervalos,
            'med_periodo': med_periodo,
            'sazo': sazo
        }
        return ret
    
    # dado um período com um valor médio inicial, calcular os novos valores do restante dado um delta num intervalo do período, mantendo a proporção dos 2 subintervalos igual
    # o "delta" também pode ser apenas a primeira série sendo o intervalo inicial o "realizado"
    def calcula_delta_serie(self, valores_ini_periodo, ini, valores_delta_intervalo, periodo_interval, periodo = 12, delta = False):
        if(isinstance(valores_ini_periodo, dict)):
            keys = sorted(list(valores_ini_periodo.keys()))
            n = len(keys)
        else:
            n = len(valores_ini_periodo)
            keys = [i for i in range(n)]
        #
        if(isinstance(valores_delta_intervalo, dict)):
            keys = sorted(list(valores_delta_intervalo.keys()))
            n = len(keys)
        else:
            n = len(valores_delta_intervalo)
            keys = [i for i in range(n)]
        #
        periodo = min(len(keys), periodo)
        datas = [self.n_next_month(ini, i) for i in range(periodo)]
        intervalos_discret = [0, periodo_interval, periodo]
        # calculando sazo com valores iniciais
        ret_ini = self.calcula_sazo_serie(valores_ini_periodo, ini, intervalos_discret = intervalos_discret)
        med_periodo_ini = ret_ini['med_periodo']
        intervalos_ini = ret_ini['valores_intervalos']
        sazo_ini = ret_ini['sazo']
        # calculando sazo dentro do intervalo restante
        restantes = valores_ini_periodo[periodo_interval:periodo]
        ini_2 = self.n_next_month(ini, periodo_interval)
        ret_restantes = self.calcula_sazo_serie(restantes, ini_2, periodo = periodo - periodo_interval)
        sazo_mes_rest = ret_restantes['sazo']
        # calculando sazo com valores corrigidos
        valores_corr = valores_delta_intervalo[:periodo_interval] + valores_ini_periodo[periodo_interval: periodo]
        ret_corr = self.calcula_sazo_serie(valores_corr, ini, intervalos_discret = intervalos_discret)
        sazo_corr = ret_corr['sazo']
        intervalo_ini_corr = ret_corr['valores_intervalos'][0]
        # nova média do período
        med_periodo = intervalo_ini_corr/sazo_ini[0]
        # calculando nova média do segundo intervalo a ser corrigido utilizando a sazo dos valores iniciais
        med_intervalo_fim_corr = med_periodo*sazo_ini[1]
        # calculando agora os valores mês a mês
        valores = valores_corr[:periodo_interval]
        for j in range(periodo_interval, periodo):
            i = j - periodo_interval
            val = sazo_mes_rest[i]*med_intervalo_fim_corr
            valores.append(val)
        #
        for j in range(len(valores)):
            valores[j] = int(round(valores[j], 0))
        #
        sazo = self.calcula_sazo_serie(valores, ini)['sazo']
        #
        ret = {
            'valores_periodo': valores,
            'med_periodo': int(round(med_periodo, 0)),
            'sazo': sazo
        }
        return ret

# Classe que opera sobre o banco de dados
class operador_db(operador_data):
    def __init__(self, credenciais = None, port = 5432):
        operador_data.__init__(self)
        self.opd = operador_data()
        import os, shutil, sys, time, datetime, pandas, requests, sklearn, numpy
        # Forcar psycopg2 a usar UTF-8 desde a primeira conexao
        os.environ['PGCLIENTENCODING'] = 'UTF8'
        self.os, self.shutil, self.sys, self.time, self.date, self.pd, self.rq, self.sk, self.np = os, shutil, sys, time, datetime, pandas, requests, sklearn, numpy
        import pickle, json, re
        self.pickle, self.json, self.re = pickle, json, re
        # funções utilizadas com frequência
        self.join, self.listdir, self.copy, self.copytree = self.os.path.join, self.os.listdir, self.shutil.copy, self.shutil.copytree
        #
        import sqlalchemy as sql
        self.sql = sql
        # paths
        self.path_credenciais = self.opd.path_credenciais
        path_cred = self.join(self.path_credenciais, '2.DB', 'credenciais.csv')
        if(credenciais is None):
            self.cred = self.pd.read_csv(path_cred, sep=';', encoding='latin-1')
            user, password, host, port, banco = self.cred.iloc[0, 1], self.cred.iloc[1, 1], self.cred.iloc[2, 1], self.cred.iloc[3, 1], self.cred.iloc[4, 1]
            try:
                if self.pd.isna(banco) or str(banco).strip().lower() == 'nan' or str(banco).strip() == '':
                    banco = 'energia'
            except Exception:
                banco = 'energia'
            credenciais = {
                'user': user,
                'password': password,
                'host': host,
                'port': port,
                'banco': banco
            }
        #
        self.credenciais = credenciais
        self.port = port
        self.engines = {}
    
    # Conectar com o banco
    def conectar_banco(self, banco = None, credenciais = None):
        if(credenciais is None):
            credenciais = self.credenciais
        if(banco is None):
            banco = credenciais['banco']
        user, password, host = credenciais['user'], credenciais['password'], credenciais['host']
        port = self.port
        #
        from urllib.parse import quote_plus
        comando = "postgresql+psycopg2://{}:{}@{}:{}/{}".format(
            quote_plus(str(user)),
            quote_plus(str(password)),
            host,
            port,
            banco
        )
        print('Comando: postgresql+psycopg2://{}:***@{}:{}/{}'.format(user, host, port, banco))
        engine = self.sql.create_engine(
            comando,
            connect_args={'options': '-c client_encoding=UTF8 -c lc_messages=C'},
            pool_pre_ping=True
        )
        # Forcar encoding UTF8 em toda conexao nova
        from sqlalchemy import event
        @event.listens_for(engine, 'connect')
        def _set_encoding(dbapi_conn, connection_record):
            dbapi_conn.set_client_encoding('UTF8')
        self.engines[banco] = engine
        
    # puxar tabela inteira
    def tabela_banco(self, tabela, banco = None, credenciais = None):
        if(credenciais is None):
            credenciais = self.credenciais
        if(banco is None):
            banco = credenciais['banco']
        #
        if(banco not in self.engines):
            self.conectar_banco(banco = banco, credenciais = credenciais)
        #
        dados = self.pd.read_sql_table(tabela, con = self.engines[banco])
        return dados

    # puxar tabela com WHERE/LIMIT no SQL (poupa memoria vs tabela_banco)
    def tabela_banco_filtrada(self, tabela, banco = None, credenciais = None,
                              where = None, params = None, columns = None,
                              limit = None):
        if(credenciais is None):
            credenciais = self.credenciais
        if(banco is None):
            banco = credenciais['banco']
        if(banco not in self.engines):
            self.conectar_banco(banco = banco, credenciais = credenciais)
        cols = '*' if not columns else ', '.join(columns)
        sql = 'SELECT {} FROM {}'.format(cols, tabela)
        if where:
            sql += ' WHERE ' + where
        if limit:
            sql += ' LIMIT {}'.format(int(limit))
        return self.pd.read_sql(sql, self.engines[banco], params = params)


    # inserir dataframe com dados em tabela, sem duplicar conjunto de linhas
    def inserir_dados_tabela(self, nome_tabela, dados, colunas = None, banco = None, credenciais = None):
        if(credenciais is None):
            credenciais = self.credenciais
        if(banco is None):
            banco = credenciais['banco']
        #
        if(banco not in self.engines):
            self.conectar_banco(banco = banco, credenciais = credenciais)
        #
        print('Banco: {}; Tabela: {}'.format(banco, nome_tabela))
        dados.to_sql(nome_tabela, self.engines[banco], index = False, if_exists = 'append')

# Classe que opera sobre arquivos e pastas do Sistema Operacional (Windows)
class operador_local_windows(operador_data):
    def __init__(self):
        operador_data.__init__(self)
        self.opd = operador_data()
        # bibliotecas utilizadas
        import os, sys, shutil, time, re, zipfile, unicodedata
        self.os, self.sys, self.shutil, self.time, self.re, self.zp, self.ucd = os, sys, shutil, time, re, zipfile, unicodedata
        import chardet as cd
        self.cd = cd
        from os.path import join, exists, abspath, dirname
        self.join, self.exists, self.abspath, self.dirname = join, exists, abspath, dirname
        from operator import itemgetter
        self.itemgetter = itemgetter
        import io
        self.io = io
        # paths
        self.PROJECT_ROOT = self.project_root()
        path_root = self.PROJECT_ROOT
        # Caminhos relativos ao projeto
        path_operadores = self.join(self.PROJECT_ROOT, '0.CLASSES')
        sys.path.append(path_operadores)
    
    def project_root(self):
        SCRIPT_DIR = self.abspath(self.dirname(__file__))
        PROJECT_ROOT = self.abspath(self.join(SCRIPT_DIR, '..'))
        return PROJECT_ROOT
    
    # verifica se token ainda é válido
    def token_valido(self, reg, limite = None, margem = 0):
        colunas = list(reg.columns)
        #
        if(limite is None):
            limite = int(colunas[colunas.index('limite')])
        #
        col = colunas.index('instante')
        instante = str(reg.iloc[0, col])
        print(instante)
        #instante = self.date.datetime.now().strftime('%Y%m%d%H%M')
        t_inicial = self.date.datetime.strptime(instante, '%Y%m%d%H%M')
        #
        t_atual = self.date.datetime.now()
        delta = (t_atual - t_inicial).total_seconds()
        print('Delta de {} segundos'.format(delta))
        if(delta > (limite - margem)): return False
        return True
    
    # retorna path_base
    def path_base(self):
        p = self.os.getcwd()
        sep = self.os.sep
        path_base = self.opd.path_middle
        return path_base
    
    # path middle no servidor Skopos
    def path_middle_skopos(self):
        path_base = self.opd.path_middle
        return path_base
    
    # converte "True"/"False" de string para booleano; Se não nenhum dos dois retorna None
    def str_bool(self, string):
        if(string is True): return True
        elif(string is False): return False
        try:
            string = string.split()[0]
            if(string == "True"): return True
            elif(string == "False"): return False
            return None
        except: return None

    # função que retorna lista de valores dentro de um "espaço" delimitado por uma chave inicial e final
    def valores_entre_chaves(self, texto, c1, c2):
        pattern = self.re.escape(c1) + r'(.*?)' + self.re.escape(c2)
        valores = self.re.findall(pattern, texto)
        return valores

    # verifica se string pode ser convertida em número inteiro
    def verifica_str_int(self, string):
        try:
            numero = int(string)
            return True
        except:
            return False

    # cria linha com base nos valores dados e suas respectivas posições (exemplo -> [ [0, 3], [5, 8], ... ])
    def cria_linha(self, valores, posicoes):
        linha = ''
        for i in range(len(valores) - 1):
            linha += valores[i] + ' '*(posicoes[i+1][0] - posicoes[i][1] - 1)
        linha += valores[-1]
        return linha + '\n'
    
    # identifica índices iniciais e finais de colunas de referência numa linha -> assumi que cada espaço inicia/termina coluna
    # "coladas" -> Se True: Trata caso em que fim de uma coluna pode estar "colado" ao início da próxima, sendo identificado por diferentes caracteres (exemplo: "xxxXXX")
    # "tratar_igual" -> Trata como início/fim de coluna independente dos caracteres em volta (padrão = "&")
    def identifica_colunas(self, linha, coladas = False):
        cols = []
        flag = False
        ultimo = linha[0]
        for i in range(len(linha)):
            is_space = (linha[i] == ' ')
            troca_col = (ultimo != '&')&(ultimo != linha[i])&(coladas)
            if((not is_space)&(not troca_col)&(not flag)):
                ultimo = linha[i]
                cols.append([i, None])
                flag = True
            elif((not is_space)&(troca_col)&(flag)):
                ultimo = linha[i]
                cols[-1][1] = i - 1
                cols.append([i, None])
            elif((is_space)&(flag)):
                ultimo = '&'
                cols[len(cols)-1][1] = i - 1
                flag = False
        if(cols[-1][1] is None): cols[-1][1] = len(linha) - 1
        return cols
    
    # transforma número inteiro em string com determinado tamanho completado com espaços à esquerda
    def formata_numero(self, numero, tamanho_numero, num_direita):
        if(num_direita is None):
            numero = str(int(numero))
            return ' '*(tamanho_numero - len(numero)) + numero
        if(num_direita == 0): numero = str(int(numero)) + '.'
        else:
            numero = str(round(numero, num_direita))
            if('.' not in numero): numero += '.0'
            numero += '0'*(num_direita - len(numero[numero.index('.') + 1:]))
        numero = ' '*(tamanho_numero - len(numero) + 1) + numero
        return numero
    
    # identifica número de casas à direita do decimal
    def num_direita(self, numero):
        numero = str(numero)
        if('.' not in numero): return 0
        index = numero.index('.')
        digitos = [str(i) for i in range(10)]
        index += 1
        qtd = 0
        while(index < len(numero)):
            if(numero[index] not in digitos): break
            qtd += 1
            index += 1
        return qtd
    
    # verifica se string é um número inteiro/float
    def verifica_se_numero(self, st):
        ch = [str(i) for i in range(10)] + ['.']
        for i in range(len(st)):
            if(st[i] not in ch): return False
        return True
    
    # Função que normaliza string (tira acentos, caracteres especias, etc)
    def normaliza_nome(self, nome):
        normalizado = self.ucd.normalize('NFD', nome).encode('ascii', 'ignore').decode("utf-8")
        return normalizado
    
    # verifica se lista só possui números inteiros/float's
    def verifica_lista_numero(self, lista):
        for elemento in lista:
            if(not self.verifica_se_numero(elemento)): return False
        return True
    
    # remove espaços da string
    def tirar_espacos(self, string):
        return "".join(string.strip())
    
    # verifica se alguma string de uma lista está numa string maior
    def verifica_elementos_lista(self, lista_strings, string):
        for elemento in lista_strings:
            if(elemento in string): return True
        return False
    
    # Função que verifica se keyword verifica condição em uma frase
    def keyword_frase(self, base, keyword, first, sub, normalizar = True):
        if(normalizar): base = self.normaliza_nome(base)
        if(not first): base, keyword = base.lower(), keyword.lower()
        if(not sub):
            if(base != keyword): return False
            return True
        elif(sub):
            if(keyword in base): return True
            return False
    
    # Função que localiza "keywords" de uma lista dentro de uma string ("Frase")
    # indice = True -> retorna lista com índices das keywords que foram encontradas
    # indice = False -> retorna lista com keywords que foram encontradas
    def lista_keywords_frase(self, frase, keywords, first_lista, sub_lista, normalizar_lista = None, indice = True):
        if(normalizar_lista is None): normalizar_lista = [True for i in range(len(keywords))]
        first_lista = [self.str_bool(first_lista[i]) for i in range(len(keywords))]
        sub_lista = [self.str_bool(sub_lista[i]) for i in range(len(keywords))]
        normalizar_lista = [self.str_bool(normalizar_lista[i]) for i in range(len(keywords))]
        encontrados = []
        for i in range(len(keywords)):
            keyword = keywords[i]
            print(keyword, first_lista[i], sub_lista[i], normalizar_lista[i])
            if(self.keyword_frase(frase, keyword, first_lista[i], sub_lista[i], normalizar = normalizar_lista[i])): encontrados.append(i)
        if(indice is False): encontrados = [keywords[i] for i in encontrados]
        return encontrados
    
    # procura se uma string é substring em uma lista de strings, se sim, retorna o índice, se não, retorna None
    def procura_string_em_lista(self, string, lista_string):
        for index in range(len(lista_string)):
            if(string in lista_string[index]): return index
        return None
    
    # retorna lista com pares ordenados dos índices inicial e final de um determinado elemento numa string
    def indices_elemento_string(self, elemento, string):
        indices = []
        desconto = 0
        while(True):
            if(elemento not in string): break
            index_ini = string.index(elemento)
            index_fim = index_ini + len(elemento)
            indices.append([index_ini + desconto, index_fim + desconto])
            string = string[index_fim:]
            if(index_fim == len(string)): break
            desconto += index_fim
        return indices
    
    # dada uma lista com pares (index_ini, index_fim) de elementos repetidos numa lista, retornar o par baseado no índice do elemento em "linha.split()"
    def identifica_par_indices_elemento_lista(self, linha, index_elemento, pares):
        contador_elementos = -1
        index = 0
        flag_elemento = False
        while(index < len(linha)):
            if(not flag_elemento):
                if(linha[index] != ' '):
                    contador_elementos += 1
                    flag_elemento = True
                    if(contador_elementos == index_elemento):
                        for i in range(len(pares)):
                            if(pares[i][0] == index): return i
                        return None
            else:
                if(linha[index] == ' '):
                    flag_elemento = False
            index += 1
        return None
    
    # abre arquivo para leitura
    def abre_arquivo_ler(self, path_arquivo, encoding = 'utf-8', errors = 'ignore'):
        arquivo = open(path_arquivo, 'r', encoding = encoding, errors = errors)
        linhas = arquivo.readlines()
        arquivo.close()
        return linhas
    
    # se for path, lê arquivo e retorna em linhas, caso contrário apenas retorna arq
    def ler_arquivo(self, arq):
        if(isinstance(arq, str)): arq = self.abre_arquivo_ler(arq)
        return arq
    
    # abre arquivo para escrita
    def abre_arquivo_escrever(self, path_arquivo, dados, encoding = 'utf-8', errors = 'ignore'):
        arquivo = open(path_arquivo, 'w', encoding = encoding, errors = errors)
        arquivo.writelines(dados)
        arquivo.close()
    
    # Mapeamento seguro de nomes de tipo (substitui eval() — evita execução de código arbitrário)
    _TIPOS_MAP = {'int': int, 'float': float, 'str': str, 'bool': bool}

    def _coerce_tipo(self, tipo, valor):
        cast = self._TIPOS_MAP.get(tipo)
        if cast is None:
            raise ValueError("Tipo nao suportado em aplicar_tipos/chaves_sumario: {!r}".format(tipo))
        return cast(valor)

    # Retorna lista valores de tipos e index das chaves numa lista
    def aplicar_tipos(self, valores, tipos_var, index_chaves = None):
        n = len(valores)
        if(isinstance(tipos_var, str)):
            tipos_var = [tipos_var]*n
        #
        if(index_chaves is None):
            index_chaves = [i for i in range(n)]
        #
        for i in index_chaves:
            valores[i] = self._coerce_tipo(tipos_var[i], valores[i])
        return valores


    # Abre arquivo .csv e retorna se já foi ou não atualizado de acordo com uma lista de chaves
    # Se 'index_chaves' for None, assumir que é a ordem sequencial
    def chaves_sumario(self, path_sumario, chave_id, tipos_var, index_chaves = None):
        n = len(chave_id)
        chave_id = [self._coerce_tipo(tipos_var[i], chave_id[i]) for i in range(n)]
        #
        if(index_chaves is None):
            index_chaves = [i for i in range(n)]
        #
        sumario = self.pd.read_csv(path_sumario, sep = ';')
        colunas = list(sumario.columns)
        sumario = sumario.values.tolist()
        #
        for index in range(len(sumario)):
            chave = [sumario[index][j] for j in index_chaves]
            chave = [self._coerce_tipo(tipos_var[i], chave[i]) for i in index_chaves]
            #
            if(chave_id == chave):
                return True
        return False
    
    # padroniza path com separador do "os"
    def padroniza_path(self, path):
        sep = self.os.path.sep
        path = path.replace("/", sep)
        return path
    
    # separa um path em elementos de uma lista
    def split_path(self, path):
        sep = self.os.path.sep
        path = self.padroniza_path(path)
        splited = path.split(sep)
        return splited
    
    # retorna path da pasta anterior
    def path_pasta_anterior(self, path):
        sep = self.os.path.sep
        splited = self.split_path(path)
        new_path = sep.join(splited[:-1])
        return new_path
    
    # retorna path da n-ésima pasta anterior
    def path_n_pasta_anterior(self, path, numero):
        contador = 0
        new_path = path
        while(True):
            new_path = self.path_pasta_anterior(new_path)
            contador += 1
            if(contador >= numero): return new_path
            if(contador > 1000): return None
    
    # apaga arquivos numa pasta
    def apagar_arqs_pasta(self, path_pasta, arqs = None):
        files = self.os.listdir(path_pasta)
        if(arqs is None): arqs = []
        for file in files:
            if(file not in arqs):
                path_file = self.os.path.join(path_pasta, file)
                self.os.remove(path_file)
    
    # retorna para pasta anterior do "os"
    def retorna_pasta_anterior(self):
        path_atual = self.os.getcwd()
        path_pasta_anterior = self.path_pasta_anterior(path_atual)
        self.os.chdir(path_pasta_anterior)
    
    # retorna para n-ésima pasta anterior
    def retorna_n_pasta_anterior(self, numero):
        contador = 0
        while(True):
            self.retorna_pasta_anterior()
            contador += 1
            if(contador > 1000): return None
    
    # avança para próxima pasta a partir do "os". Se erro, retorna None
    def proxima_pasta(self, nome_pasta):
        path_pasta = self.os.path.join(self.os.getcwd(), nome_pasta)
        if(self.os.path.isdir(path_pasta)): self.os.chdir(path_pasta)
        else: return None
    
    # cria pasta no diretório atual ou em "path" caso especificado, entrando na pasta criada se "seguir" = True pelo "os"
    def cria_pasta(self, pasta, seguir = False, path = None):
        if(path is not None):
            if(not self.os.path.exists(path)): return None
            full_path = self.os.path.join(path, pasta)
        else: full_path = self.os.path.join(self.os.getcwd(), pasta)
        if(not self.os.path.isdir(full_path)): self.os.mkdir(full_path)
        if(seguir): self.os.chdir(full_path)
    
    # verifica se arquivo foi baixado
    def verifica_baixado(self, path_arq, remover = True, size_min = 1000):
        size = self.os.path.getsize(path_arq)
        if(size < size_min): baixado = False
        else: baixado = True
        if((remover)&(not baixado)): self.os.remove(path_arq)
        return baixado
    
    # zipar arquivos selecionados de uma pasta (se "lista" = None). Se "path_zip" = None mantém zip na próxima pasta
    def zipar_arquivos(self, path_pasta, arquivos = None, path_zip = None):
        if(path_zip is None):
            pasta = self.split_path(path_pasta)[-1]
            path_zip = self.os.path.join(path_pasta, pasta + '.zip')
        if(self.os.path.exists(path_zip)): return None
        todos_arquivos = self.os.listdir(path_pasta)
        if(arquivos is None): arquivos = todos_arquivos
        else:
            lista = []
            for arquivo in arquivos:
                if(arquivo in todos_arquivos): lista.append(arquivo)
            arquivos = lista
        if(len(arquivos) == 0): return None
        comando = '7z a "' + path_zip + '"'
        for i in range(len(arquivos)):
            path_arquivo = self.padroniza_path(self.os.path.join(path_pasta, arquivos[i]))
            comando += ' "' + path_arquivo + '"'
        self.os.system(comando)
    
    # adiciona arquivo a um zip
    def add_arq_zip(self, path_file, path_zip):
        comando = '7z a -tzip "{z}" "{f}"'.format(z = path_zip, f = path_file)
        self.os.system(comando)
    
    # retorna dicionário com arquivos dentro de um .zip
    def dict_zip(self, path_zip):
        zip_files = self.zp.ZipFile(path_zip).namelist()
        zip_dict = {'files': [], 'folders': []}
        for file in zip_files:
            splited = file.split('/')
            if(len(splited) == 1): zip_dict['files'].append(splited[0])
            else: zip_dict['folders'].append(splited[0])
        return zip_dict
    
    # retorna lista com arquivos dentro de um zip
    def files_zip(self, path_zip):
        ret = self.zp.ZipFile(path_zip).namelist()
        return ret
    
        # insere carga publicada do decomp em dadger
    def carga_decomp_nome(self, ano_mes_rev):
        path_arquivos = self.join(self.path_decomp, 'Carga', 'arquivos')
        files = self.os.listdir(path_arquivos)
        ano, mes, rev = ano_mes_rev.split('_')
        ano, mes, rev = int(ano), int(mes), int(rev)
        zip_carga1 = 'RV{}_PMO_{}{}_carga_semanal.zip'.format(rev, self.opd.meses_nomes[mes - 1], ano)
        zip_carga2 = 'RV{}_PMO_{}_{}_carga_semanal.zip'.format(rev, self.opd.meses_nomes[mes - 1], ano)
        #
        if(zip_carga1 in files):
            zip_file = zip_carga1
        elif(zip_carga2 in files):
            zip_file = zip_carga2
        else:
            return None
        path_zip = self.join(path_arquivos, zip_file)
        return path_zip
    
    # transforma linhas de texto para encoding = utf-8; e padroniza EOL
    def padroniza_linhas(self, linhas, decoding = 'utf-8', EOL = '\n'):
        try:
            linhas = [
                line.decode(decoding) if isinstance(line, bytes) else line for line in linhas
            ]
        except:
            linhas = [
                line.decode('latin1') if isinstance(line, bytes) else line for line in linhas
            ]
        linhas = [line.replace('\r\n', '\n') for line in linhas]
        return linhas
    
    # ler arquivo por linhas dentro de um .zip; in_name -> se "file" estiver no nome do arquivo na lista, selecionar o mesmo
    def ler_arquivo_em_zip(self, path_zip, file, in_name = True, encoding = 'utf-8', tipo = 'txt', lower = False):
        if(not self.os.path.exists(path_zip)):
            print('Não existe')
            return None
        if(self.os.path.getsize(path_zip) < 100):
            print('Arquivo pequeno')
            return None
        files = self.files_zip(path_zip)
        if(lower):
            files_l = [f.lower() for f in files]
        print(files)
        if(file not in files):
            if(in_name):
                encontrado = False
                if(lower):
                    index_file = self.procura_string_em_lista(file, files_l)
                else:
                    index_file = self.procura_string_em_lista(file, files)
                if(index_file is None):
                    return None
                file = files[index_file]
            else:
                return None
        #
        zf = self.zp.ZipFile(path_zip)
        if(tipo == 'txt'):
            arq = zf.open(file, 'r')
            lines = arq.readlines()
            arq.close()
            try:
                lines = [
                    line.decode('utf-8') if isinstance(line, bytes) else line for line in lines
                ]
            except:
                lines = [
                    line.decode('latin1') if isinstance(line, bytes) else line for line in lines
                ]
            return [line.replace('\r\n', '\n') for line in lines]
        elif(tipo == 'csv'):
            lines = self.pd.read_csv(zf.open(file), sep = ';', encoding = encoding).reset_index(drop = True)
        return lines
    
    # ler arquivo de um .zip dentro de outro .zip
    def ler_arquivo_em_zip_1(self, path_zip, file, encoding = 'utf-8', tipo = 'txt', lower = False):
        linhas = None
        zf = self.zp.ZipFile(path_zip)
        #
        arq = zf.open(file, 'r')
        linhas = arq.readlines()
        arq.close()
        return linhas
    
    # ler arquivo de um .zip dentro de outro .zip
    def ler_arquivo_em_zip_2(self, path_zip, zip_2, file, encoding = 'utf-8', tipo = 'txt', lower = False):
        linhas = None
        with self.zp.ZipFile(path_zip, 'r') as outer_zip:
            inner_bytes = outer_zip.read(zip_2)
            inner_zip_buffer = self.io.BytesIO(inner_bytes)
            with self.zp.ZipFile(inner_zip_buffer, 'r') as inner_zip:
                arq = inner_zip.open(file, 'r')
                linhas = arq.readlines()
                arq.close()
        return linhas
    
    # extrair arquivo de um zip
    def extrair_arq_zip(self, path_zip, arq, arq_saida, path_pasta_saida = None):
        if(path_pasta_saida is None): path_pasta_saida = self.path_pasta_anterior(path_zip)
        path_arq_saida = self.os.path.join(path_pasta_saida, arq_saida)
        zip = self.zp.ZipFile(path_zip)
        f = zip.open(arq)
        content = f.read()
        f = open(path_arq_saida, 'wb')
        f.write(content)
        f.close()

    # excluir arquivo dentro de um .zip
    def excluir_arquivo_zip(self, arquivo_zip, arquivo_para_excluir):
        temp_zip = arquivo_zip + ".temp"  # Criar um arquivo temporário
        with self.zp.ZipFile(arquivo_zip, 'r') as zip_original:
            with self.zp.ZipFile(temp_zip, 'w') as zip_novo:
                for item in zip_original.infolist():
                    if item.filename != arquivo_para_excluir:
                        zip_novo.writestr(item, zip_original.read(item.filename))  # Copia os arquivos exceto o removido
        self.os.replace(temp_zip, arquivo_zip)
    
    # Encontra Deck Newave ou Decomp e retorna path_pasta ou zip
    def encontra_deck(self, data, modelo, rev, entrada = False):
        modelos = {
            'NEWAVE': '0.NEWAVE',
            'DECOMP': '1.DECOMP',
            'DESSEM': '2.DESSEM',
            'GEVAZP': '3.GEVAZP'
        }
        modelo = modelo.upper()
        #
        pmo = self.opd.data_string_to_date(data)
        pmo = self.opd.data_ano_mes(pmo)
        ano = pmo.year
        mes = pmo.month
        ano_mes_pmo = pmo.strftime("%Y%m")
        mes_str = pmo.strftime('%m')
        semana = rev + 1
        #
        repub = 'publicacao'
        nome_saida_dc = 'relatorio_sumario'
        #
        path_decks = r'{}\{}'.format(self.path_decks, modelos[modelo])
        path_ano = self.join(path_decks, str(ano))
        mes_nome = self.opd.meses_nomes[mes - 1][:3].upper()
        pasta = '{}.{}'.format(mes_str, mes_nome)
        path_pasta = self.join(path_ano, pasta)
        print(path_pasta)
        #
        if(modelo == 'NEWAVE'):
            # Prioridade: CCEE -> ONS -> ONS_pre -> OFICIAL (legado)
            fontes_newave = ['CCEE', 'ONS', 'ONS_pre', 'OFICIAL']
            path_pasta_nw = None
            fonte_encontrada = None
            for fonte_nw in fontes_newave:
                candidato = self.join(path_ano, pasta, fonte_nw)
                if self.exists(candidato):
                    path_pasta_nw = candidato
                    fonte_encontrada = fonte_nw
                    break
            if path_pasta_nw is None:
                # Fallback: pasta direta (sem subfonte)
                path_pasta_nw = self.join(path_ano, pasta)
                if not self.exists(path_pasta_nw):
                    return None
                fonte_encontrada = 'direto'
            path_pasta = path_pasta_nw
            print(f'[encontra_deck] NEWAVE fonte: {fonte_encontrada} -> {path_pasta}')
        elif(modelo == 'DECOMP'):
            if(not self.exists(path_pasta)):
                return None
            pastas_rv = self.os.listdir(path_pasta)
            #pastas_rv = sorted(pastas_rv)
            pastas_rvv = ['RV{}'.format(rv) for rv in range(5)]
            pastas_rvv = list(reversed(pastas_rvv))
            pasta_rv = None
            for i in range(5):
                pr = pastas_rvv[i]
                if(pr in pastas_rv):
                    pasta_rv = pr
                    break
            if(pasta_rv is None): return None
            print(pasta_rv, pastas_rv)
            path_pasta = self.join(path_pasta, pasta_rv)
            # zips na pasta
            files = self.os.listdir(path_pasta)
            print(files)
            if(not entrada):
                # Sem republicacao
                file_0 = 'Relatorio_Sumario-{}-sem{}.zip'.format(ano_mes_pmo, semana)
                files_repub = ['Relatorio_Sumario-{}-sem{}_{}aPublicacao.zip'.format(ano_mes_pmo, semana, num) for num in range(1, 5)]
                files_tot = [file_0] + files_repub
                print(files_tot)
            else:
                file_0 = 'DC{}-sem{}.zip'.format(ano_mes_pmo, semana)
                files_repub = ['DC{}-sem{}_{}aPublicacao.zip'.format(ano_mes_pmo, semana, num) for num in range(1, 5)]
                files_tot = [file_0] + files_repub
                print(files_tot)
            # Identificando o mais atualizado
            last_zip = None
            index = 0
            while(index < len(files_tot)):
                file = files_tot[index]
                if(file in files):
                    last_zip = file
                else:
                    break
                index += 1
            #
            if(last_zip is None):
                print('Sem saída Decomp')
                return None
            else:
                path_deck = self.join(path_pasta, last_zip)
                print(path_deck)
                return path_deck
        #
        if(not self.os.path.exists(path_pasta)):
            print('{} não tem deck NW'.format(pmo))
            return None
        # Se houver .zip
        files = self.os.listdir(path_pasta)
        print(data)
        zips = []
        for file in files:
            if('.zip' in file):
                zips.append(file)
        # se não houver zip
        if(len(zips) == 0):
            print('Sem zips')
            if(modelo == 'DECOMP'):
                return None
            return path_pasta
        else:
            if(len(zips) == 1):
                path_deck = self.join(path_pasta, zips[0])
            else:
                #
                num_max = 0
                last_zip = None
                for i in range(len(zips)):
                    for num in range(1, len(zips)):
                        repub_num = '{}a{}.zip'.format(num, repub)
                        if(repub_num in zips[i].lower()):
                            if(num > num_max):
                                num_max = num
                                last_zip = zips[i]
                path_deck = self.join(path_pasta, last_zip)
            print(path_deck)
            return path_deck
        return None

    # ── Formatação visual "bem energia" ────────────────────────────────────────

    # Formata um gráfico matplotlib no estilo visual bem energia (fundo claro,
    # logo no canto superior direito, data no topo esquerdo, título, rodapé).
    # Recebe uma figure matplotlib (ou path de imagem existente) e retorna
    # path do PNG final estilizado.
    # Parâmetros:
    #   fig_or_path  - matplotlib Figure OU string com path de PNG existente
    #   titulo       - título principal (negrito)
    #   subtitulo    - subtítulo menor (opcional)
    #   fonte        - texto de fonte no rodapé (ex: "Fonte: ONS - Boletim Diário")
    #   data_texto   - texto da data no topo esquerdo (se None, usa data atual)
    #   path_output  - path de saída do PNG (se None, cria temp)
    #   dpi          - resolução da imagem
    #   logo_path    - path do logo (se None, usa logo_2.png de 5.AUXILIARES)
    def formatar_grafico_bem(self, fig_or_path, titulo='', subtitulo='',
                              fonte='', data_texto=None, path_output=None,
                              dpi=180, logo_path=None):
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import matplotlib.image as mpimg
        import matplotlib.patches as mpatches
        import tempfile
        import datetime as dt
        import io as _io
        import numpy as _np
        #
        # Paleta bem energia (tema claro para gráficos)
        COR_FUNDO = '#FFFFFF'
        COR_HEADER = '#F5F5F5'
        COR_FOOTER = '#F5F5F5'
        COR_TITULO = '#1a1a1a'
        COR_SUBTITULO = '#555555'
        COR_DATA = '#888888'
        COR_FOOTER_TXT = '#999999'
        COR_ACCENT = '#C8E600'
        COR_BORDA = '#E0E0E0'
        #
        # Logo
        if logo_path is None:
            logo_path = self.join(self.os.path.dirname(__file__), '..', '5.AUXILIARES', 'logo_2.png')
            logo_path = self.os.path.abspath(logo_path)
        #
        # Data texto
        if data_texto is None:
            data_texto = dt.datetime.now().strftime('%d/%m/%Y')
        #
        # Converter fig matplotlib para imagem em buffer
        if isinstance(fig_or_path, str):
            # É um path de arquivo PNG existente
            chart_img = mpimg.imread(fig_or_path)
        else:
            # É uma figure matplotlib
            buf = _io.BytesIO()
            fig_or_path.savefig(buf, format='png', dpi=dpi, bbox_inches='tight',
                                facecolor='white', edgecolor='none')
            plt.close(fig_or_path)
            buf.seek(0)
            chart_img = mpimg.imread(buf)
        #
        # Dimensões do layout composto
        chart_h, chart_w = chart_img.shape[:2]
        aspect = chart_w / chart_h
        #
        FIG_W = 14.0
        HEADER_H = 1.2
        FOOTER_H = 0.5
        CHART_H = FIG_W / aspect
        FIG_H = HEADER_H + CHART_H + FOOTER_H
        #
        fig_out = plt.figure(figsize=(FIG_W, FIG_H), facecolor=COR_FUNDO)
        #
        # Coordenadas normalizadas
        h_header = HEADER_H / FIG_H
        h_footer = FOOTER_H / FIG_H
        h_chart = CHART_H / FIG_H
        #
        # ── Header (logo + data + titulo) ──
        ax_header = fig_out.add_axes([0, 1 - h_header, 1, h_header])
        ax_header.set_xlim(0, 1)
        ax_header.set_ylim(0, 1)
        ax_header.set_facecolor(COR_HEADER)
        ax_header.axis('off')
        #
        # Linha accent inferior do header
        ax_header.plot([0, 1], [0, 0], color=COR_ACCENT, linewidth=3,
                       transform=ax_header.transAxes, clip_on=False, zorder=5)
        #
        # Data (topo esquerdo)
        ax_header.text(0.02, 0.78, data_texto, fontsize=9, color=COR_DATA,
                       ha='left', va='top', transform=ax_header.transAxes,
                       fontfamily='sans-serif')
        #
        # Titulo
        ax_header.text(0.02, 0.45, titulo, fontsize=15, color=COR_TITULO,
                       ha='left', va='center', transform=ax_header.transAxes,
                       fontweight='bold', fontfamily='sans-serif')
        #
        # Subtitulo
        if subtitulo:
            ax_header.text(0.02, 0.15, subtitulo, fontsize=11, color=COR_SUBTITULO,
                           ha='left', va='center', transform=ax_header.transAxes,
                           fontfamily='sans-serif')
        #
        # Logo (canto superior direito)
        try:
            logo_img = mpimg.imread(logo_path)
            logo_asp = logo_img.shape[1] / logo_img.shape[0]
            logo_h_frac = 0.65
            logo_w_frac = logo_h_frac * logo_asp * (HEADER_H / FIG_W) * (FIG_H / HEADER_H)
            # Corrigir proporção: logo_w em coordenadas de fig
            logo_w_fig = logo_h_frac * logo_asp * (HEADER_H / FIG_W)
            ax_logo = fig_out.add_axes([
                1 - logo_w_fig - 0.01,
                1 - h_header + h_header * 0.175,
                logo_w_fig,
                h_header * logo_h_frac
            ])
            ax_logo.imshow(logo_img, aspect='equal')
            ax_logo.axis('off')
        except Exception as e:
            print(f'Aviso logo grafico_bem: {e}')
        #
        # ── Chart (imagem do gráfico) ──
        ax_chart = fig_out.add_axes([0.02, h_footer, 0.96, h_chart])
        ax_chart.imshow(chart_img, aspect='auto')
        ax_chart.axis('off')
        #
        # ── Footer ──
        ax_footer = fig_out.add_axes([0, 0, 1, h_footer])
        ax_footer.set_xlim(0, 1)
        ax_footer.set_ylim(0, 1)
        ax_footer.set_facecolor(COR_FOOTER)
        ax_footer.axis('off')
        #
        # Linha accent superior do footer
        ax_footer.plot([0, 1], [1, 1], color=COR_BORDA, linewidth=1,
                       transform=ax_footer.transAxes, clip_on=False, zorder=5)
        #
        # Fonte (esquerda)
        if fonte:
            ax_footer.text(0.02, 0.5, fonte, fontsize=8, color=COR_FOOTER_TXT,
                           ha='left', va='center', transform=ax_footer.transAxes,
                           fontfamily='sans-serif')
        #
        # bemenergia.com (direita)
        ax_footer.text(0.98, 0.5, 'bemenergia.com', fontsize=8, color=COR_FOOTER_TXT,
                       ha='right', va='center', transform=ax_footer.transAxes,
                       fontfamily='sans-serif')
        #
        # ── Salvar ──
        if path_output is None:
            temp_dir = tempfile.gettempdir()
            path_output = self.join(temp_dir, f'grafico_bem_{dt.datetime.now().strftime("%Y%m%d%H%M%S")}.png')
        #
        fig_out.savefig(path_output, dpi=dpi, facecolor=COR_FUNDO,
                        bbox_inches='tight', pad_inches=0.05)
        plt.close(fig_out)
        print(f'Grafico bem salvo: {path_output}')
        return path_output

    # Gera imagem estilizada de tabela no padrão visual "bem energia"
    # (fundo escuro, logo, titulo, heatmap, etc).
    # Wrapper sobre tabela_bem.gerar_imagem_tabela para uso como método de classe.
    # Parâmetros:
    #   df            - DataFrame pandas com os dados
    #   titulo        - título principal
    #   subtitulo     - subtítulo (opcional)
    #   path_output   - path de saída (se None, cria temp)
    #   dpi           - resolução
    #   logo_path     - path do logo (se None, usa logo.png de 5.AUXILIARES)
    #   heatmap_colunas    - False, True ou lista de índices
    #   heatmap_invertido  - inverte colormap do heatmap
    #   linhas_total       - lista de labels que são linhas de total
    #   flag               - "sem_heatmap" | "com_heatmap" | None
    #   cabecalho_grupo    - lista de tuplas (nome_grupo, n_colunas) para cabeçalho duplo
    #   col_larguras       - lista de frações de largura por coluna
    #   fmt_numero         - formato de número (ex: "{:.0f}")
    def formatar_tabela_bem(self, df, titulo='', subtitulo='', path_output=None,
                             dpi=180, logo_path=None, heatmap_colunas=False,
                             heatmap_invertido=False, linhas_total=None, flag=None,
                             cabecalho_grupo=None, col_larguras=None, fmt_numero='{:.0f}',
                             fonte='', data_texto=None,
                             font_size_label=9.5, font_size_data=9):
        import sys as _sys
        import tempfile
        import datetime as dt
        import pandas as _pd
        #
        # Garantir que 5.AUXILIARES está no path
        path_aux = self.join(self.os.path.dirname(__file__), '..', '5.AUXILIARES')
        path_aux = self.os.path.abspath(path_aux)
        if path_aux not in _sys.path:
            _sys.path.insert(0, path_aux)
        #
        from tabela_bem import gerar_imagem_tabela
        #
        # Logo (usa logo_2.png para fundo claro)
        if logo_path is None:
            logo_path = self.join(path_aux, 'logo_2.png')
        #
        # Reset index se necessário (index customizado → coluna)
        if not isinstance(df.index, _pd.RangeIndex):
            df = df.reset_index()
            if 'index' in df.columns:
                df = df.rename(columns={'index': ''})
        #
        # Output path
        if path_output is None:
            temp_dir = tempfile.gettempdir()
            path_output = self.join(temp_dir, f'tabela_bem_{dt.datetime.now().strftime("%Y%m%d%H%M%S")}.png')
        #
        gerar_imagem_tabela(
            df,
            titulo=titulo,
            subtitulo=subtitulo,
            output=path_output,
            logo_path=logo_path,
            dpi=dpi,
            col_larguras=col_larguras,
            fmt_numero=fmt_numero,
            cabecalho_grupo=cabecalho_grupo,
            linhas_total=linhas_total or [],
            heatmap_colunas=heatmap_colunas,
            heatmap_invertido=heatmap_invertido,
            flag=flag,
            fonte=fonte,
            data_texto=data_texto,
            font_size_label=font_size_label,
            font_size_data=font_size_data,
        )
        print(f'Tabela bem salva: {path_output}')
        return path_output

# Classe que opera sobre as funções do API do Telegram com biblioteca "telebot"
class operador_Telegram(operador_local_windows):
    def __init__(self, telebot = True, espera_ciclos = 70, intervalo_msg = 2, max_msg_ciclo = 20, intervalo_ciclos = 70, controle_requests = True):
        operador_local_windows.__init__(self)
        import telebot, pandas, os, time, re
        self.telebot, self.pd, self.os, self.time, self.re = telebot, pandas, os, time, re
        self.bot = None
        self.path_folder_bot = self.os.path.join(self.path_middle, '8.CREDENCIAIS', '3.TELEGRAM', 'Energy_bot')
        self.path_credenciais = self.os.path.join(self.path_folder_bot, 'credenciais.csv')
        self.path_chat = self.os.path.join(self.path_folder_bot, 'chat_id.csv')
        self.msg_control = {
            'espera_ciclos': espera_ciclos,
            'intervalo_msg': intervalo_msg,
            'intervalo_ciclos': intervalo_ciclos,
            'max_msg_ciclo': max_msg_ciclo,
            'contador': 0,
            'tempo_msgs': [],
            'resets': 0,
            'controle_requests': controle_requests
        }
        import operadores_Web as opw
        self.opw = opw
    
    # Iniciando bot, lendo o token
    def iniciar_bot(self):
        token = self.pd.read_csv(self.path_credenciais).iloc[0, 0]
        self.bot = self.telebot.TeleBot(token)
    
    # Ler tempo da última mensagem no cache
    def ler_last_msg(self):
        path_cache = self.os.path.join(self.path_folder_bot, 'cache.csv')
        tempo_last_msg = float(self.pd.read_csv(path_cache, sep = ';').iloc[0, 0])
        print('Última msg: ', tempo_last_msg)
        try:
            tempo_last_msg = float(tempo_last_msg)
            if(self.time.time() - tempo_last_msg < self.msg_control['intervalo_ciclos']): self.reg_msg_enviada(tempo = tempo_last_msg)
        except: pass
    
    # Escreve tempo da última mensagem no cache
    def escreve_last_msg(self):
        #tempo_last_msg = float(self.msg_control['tempo_msgs'][-1])
        path_cache = self.os.path.join(self.path_folder_bot, 'cache.csv')
        tempo_last_msg = float(self.pd.read_csv(path_cache, sep = ';').iloc[0, 0])
        if(tempo_last_msg == []): return None
        tempo_last_msg = float(tempo_last_msg)
        path_cache = self.os.path.join(self.path_folder_bot, 'cache.csv')
        cache = self.pd.read_csv(path_cache, sep = ';')
        cache.iloc[0, 0] = float(tempo_last_msg)
        cache.to_csv(path_cache, sep = ';', index = False)
    
    # Atualiza informações do ciclo atual
    def atualizar_ciclo(self, tempo = None):
        if(self.msg_control['tempo_msgs'] == []): return None
        if(tempo is None): tempo = self.time.time()
        i = 0
        while(i < len(self.msg_control['tempo_msgs'])):
            if(tempo - self.msg_control['tempo_msgs'][i] > self.msg_control['intervalo_ciclos']):
                self.msg_control['tempo_msgs'].pop(i)
                self.msg_control['contador'] += (-1)
            else: i += 1
    
    # Reseta status de mensagens
    def reset_msg_status(self):
        self.msg_control['contador'] = 0
        self.msg_control['tempo_msgs'] = []
    
    # Registra status após enviar mensagem
    def reg_msg_enviada(self, tempo = None):
        if(tempo is None): tempo = self.time.time()
        self.msg_control['contador'] += 1
        self.msg_control['tempo_msgs'] += [tempo]
    
    # Checa se bate no cota de requests;
    # 'esperar' = True -> então aguarda 'espera_ciclos' segundos e reseta status de controle de mensagens
    def check_msg_requests(self, esperar = True):
        if(self.msg_control['tempo_msgs'] == []): return None
        tempo_atual = self.time.time()
        def esperar_tempo(tempo):
            print('Espera de {tempo} segundos...'.format(tempo = int(tempo)))
            self.time.sleep(tempo)
        # se contador passar, aguardar 'intervalo_ciclos' e resetar status
        if(self.msg_control['contador'] >= self.msg_control['max_msg_ciclo']):
            tempo_espera = self.msg_control['espera_ciclos'] - (tempo_atual - self.msg_control['tempo_msgs'][-1])
            tempo_espera = float(tempo_espera)
            if((esperar is True)&(tempo_espera > 0)): esperar_tempo(tempo_espera)
            self.reset_msg_status()
            return None
        if(tempo_atual - self.msg_control['tempo_msgs'][-1] < self.msg_control['intervalo_msg']):
            tempo_espera = self.msg_control['intervalo_msg'] - (tempo_atual - self.msg_control['tempo_msgs'][-1])
            if((esperar is True)&(tempo_espera > 0)): esperar_tempo(tempo_espera)
            return None
    
    # Pegar chat_id de um contato/grupo dado a "string" com o nome
    def get_cache_chat_id(self, contato):
        dados = self.pd.read_csv(self.path_chat, sep = ';')
        chat_id = None
        for i in range(dados.shape[0]):
            if(contato == dados.iloc[i, 0]):
                try: chat_id = int(dados.iloc[i, 1])
                except: return None
                break
        return chat_id
    
    # Enviar mensagem para contato/chat_id (se for "string" entende como contato, se for "int" entende como chat_id)
    def enviar_msg(self, contato, msg, iniciar = True, img = False, html = False, msg_fig = None):
        if(type(contato) == type('string')): contato = self.get_cache_chat_id(contato)
        if((self.bot is None)&(iniciar is True)): self.iniciar_bot()
        elif((self.bot is None)&(iniciar is not True)): return None
        if(self.msg_control['controle_requests'] is True):
            if((self.msg_control['contador'] == 0)&(self.msg_control['resets'] == 0)):
                self.ler_last_msg()
            self.atualizar_ciclo()
            self.check_msg_requests()
        if(not img):
            print(contato, msg)
            if(html): self.bot.send_message(contato, msg, parse_mode = 'html')
            else: self.bot.send_message(contato, msg)
        else:
            if(msg_fig is None): self.bot.send_photo(contato, photo = open(msg, 'rb'))
            else:
                with open(msg, 'rb') as photo:
                    self.bot.send_photo(contato, photo, caption = msg_fig)
        if(self.msg_control['controle_requests'] is True):
            self.reg_msg_enviada()
            self.escreve_last_msg()
    
    # Colore tabela de uma coluna i até j de certa cor
    def table_html_color(self, table, ini, fim, cor):
        tipo = str(type(table))
        if('Styler' not in tipo):
            st = table.style.set_table_styles()
        else:
            st = table
        #
        cols = st.columns[ini:fim + 1]
        ret = st.applymap(
            lambda v: 'background-color: {}'.format(cor),
            subset = self.pd.IndexSlice[:, cols]
        )
        return ret
    
    # Aplica básico de estilo na tabela
    def table_html_basic(self, table):
        tipo = str(type(table))
        if('Styler' not in tipo):
            st = table.style.set_table_styles()
        else:
            st = table
        #
        ret = st.set_table_styles(
            [
                {'selector': 'table', 'props': [('width', '600px')]},
                {'selector': 'th, td', 'props': [
                    ('border', '1px solid black'),
                    ('text-align', 'center'),
                    ('width', '120px'),
                    ('font-size', '14px')
                ]
                }
            ]
        ).set_properties(**{
            'text-align': 'center',
            'border': '1px solid black'
        })
        return ret
    
    # Transforma tabela em .html, abre com table para tirar print e enviar pelo telegram
    def envia_table_html_telegram(self, contato, table, msg_fig = None, basic = True):
        try:
            # Define o estilo da tabela: largura e centralização
            if(basic):
                table = self.table_html_basic(table)
            #
            html_table = table.to_html()
            print(html_table)
            #
            nav = self.opw.navegador('chrome')
            path_table = self.os.path.join(nav.path_sandbox, 'table.html')
            print(path_table)
            with open(path_table, "w", encoding = "utf-8") as file:
                file.write(html_table)
            self.time.sleep(2)
            nav.driver.get(path_table)
            #
            element = nav.driver.find_element(nav.By.TAG_NAME, "table")
            png = element.screenshot_as_png
            path_png = self.os.path.join(nav.path_sandbox, 'table.png') 
            with open(path_png, "wb") as file:
                file.write(png)
            #
            nav.driver.quit()
            self.time.sleep(2)
            print('Navegador fechado')
            self.enviar_msg(contato, path_png, img = True, msg_fig = msg_fig)
            print('Enviado')
            self.os.remove(path_table)
            self.os.remove(path_png)
        except Exception as e:
            print('Exception: ', e)
            try:
                nav.driver.quit()
                self.time.sleep(2)
                print('Navegador fechado')
                self.enviar_msg(contato, path_png, img = True)
                print('Enviado')
                self.os.remove(path_table)
                self.os.remove(path_png)
            except:
                pass

    # ── Métodos de envio estilizado via Telegram ───────────────────────────────

    # Formata gráfico no padrão "bem energia" e envia via Telegram.
    # Aceita figure matplotlib OU path de PNG existente.
    # Parâmetros:
    #   contato      - nome do contato ou chat_id
    #   fig_or_path  - matplotlib Figure ou path de PNG
    #   titulo       - título do gráfico
    #   subtitulo    - subtítulo (opcional)
    #   fonte        - texto de fonte no rodapé
    #   data_texto   - data no topo esquerdo (None = data atual)
    #   dpi          - resolução
    #   logo_path    - path do logo (None = logo_2.png padrão)
    #   msg_fig      - caption da foto no Telegram (opcional)
    def enviar_grafico_bem(self, contato, fig_or_path, titulo='', subtitulo='',
                            fonte='', data_texto=None, dpi=180, logo_path=None,
                            msg_fig=None):
        import tempfile
        #
        tmp_path = self.os.path.join(tempfile.gettempdir(), '_grafico_bem_tg.png')
        self.formatar_grafico_bem(
            fig_or_path, titulo=titulo, subtitulo=subtitulo,
            fonte=fonte, data_texto=data_texto, path_output=tmp_path,
            dpi=dpi, logo_path=logo_path
        )
        self.enviar_msg(contato, tmp_path, img=True, msg_fig=msg_fig)
        try:
            self.os.remove(tmp_path)
        except Exception:
            pass

    # Gera tabela estilizada "bem energia" e envia via Telegram.
    # Parâmetros:
    #   contato           - nome do contato ou chat_id
    #   df                - DataFrame pandas
    #   titulo            - título da tabela
    #   subtitulo         - subtítulo (opcional)
    #   dpi               - resolução
    #   logo_path         - path do logo (None = logo.png padrão)
    #   heatmap_colunas   - False, True ou lista de índices
    #   heatmap_invertido - inverte colormap
    #   linhas_total      - lista de labels de linhas-total
    #   flag              - "sem_heatmap" | "com_heatmap" | None
    #   cabecalho_grupo   - lista de tuplas (nome, n_cols)
    #   msg_fig           - caption da foto no Telegram (opcional)
    def enviar_tabela_bem(self, contato, df, titulo='', subtitulo='',
                           dpi=180, logo_path=None, heatmap_colunas=False,
                           heatmap_invertido=False, linhas_total=None, flag=None,
                           cabecalho_grupo=None, col_larguras=None, fmt_numero='{:.0f}',
                           fonte='', msg_fig=None, data_texto=None,
                           font_size_label=9.5, font_size_data=9):
        import tempfile
        #
        tmp_path = self.os.path.join(tempfile.gettempdir(), '_tabela_bem_tg.png')
        self.formatar_tabela_bem(
            df, titulo=titulo, subtitulo=subtitulo,
            path_output=tmp_path, dpi=dpi, logo_path=logo_path,
            heatmap_colunas=heatmap_colunas, heatmap_invertido=heatmap_invertido,
            linhas_total=linhas_total, flag=flag, cabecalho_grupo=cabecalho_grupo,
            col_larguras=col_larguras, fmt_numero=fmt_numero, fonte=fonte,
            data_texto=data_texto,
            font_size_label=font_size_label, font_size_data=font_size_data,
        )
        self.enviar_msg(contato, tmp_path, img=True, msg_fig=msg_fig)
        try:
            self.os.remove(tmp_path)
        except Exception:
            pass


# ══════════════════════════════════════════════════════════════════════
# Classe para geração de dados e servir dashboards HTML
# Generaliza consultas DB → JSON, servidor local e exportação offline
# ══════════════════════════════════════════════════════════════════════
class operador_dash(operador_db):
    def __init__(self, credenciais = None, port = 5432, porta_servidor = 8050):
        operador_db.__init__(self, credenciais = credenciais, port = port)
        import json, os, sys
        self.json, self.os, self.sys = json, os, sys
        from datetime import date, timedelta
        self.date_cls, self.timedelta_cls = date, timedelta
        from http.server import HTTPServer, SimpleHTTPRequestHandler
        self.HTTPServer, self.SimpleHTTPRequestHandler = HTTPServer, SimpleHTTPRequestHandler
        from urllib.parse import urlparse, parse_qs
        self.urlparse, self.parse_qs = urlparse, parse_qs
        #
        self.porta_servidor = porta_servidor
        # Mapa de subsistemas (número → sigla)
        self.SUB_MAP = {'1': 'SE', '2': 'S', '3': 'NE', '4': 'N'}
        self.SUBS = ['SE', 'S', 'NE', 'N']
        # Registro de rotas da API: { '/api/xyz': funcao_que_retorna_dict }
        self.rotas_api = {}
        # Path base para dashboards
        self.path_dashs = self.join(self.path_middle, '6.ON_DEMAND', '0.DASHS')

    # ──────────────────────────────────────────────
    # UTILITÁRIOS: conversão de subsistema
    # ──────────────────────────────────────────────

    def sub_nome(self, sub_raw):
        """Converte código de subsistema ('1','2','3','4' ou nome) para sigla padrão."""
        sub_raw = str(sub_raw).strip()
        return self.SUB_MAP.get(sub_raw, sub_raw)

    # ──────────────────────────────────────────────
    # UTILITÁRIOS: leitura flexível de colunas
    # ──────────────────────────────────────────────

    def _ler_valor(self, row, colunas_possiveis):
        """Tenta ler um valor numérico de uma lista de nomes de coluna possíveis."""
        for col in colunas_possiveis:
            if col in row.index:
                try:
                    return float(str(row[col]).replace(',', '.'))
                except:
                    pass
        return None

    def _ler_data(self, row, colunas_possiveis = ['data_deck', 'data', 'dt']):
        """Lê campo de data e converte para YYYY-MM-DD."""
        for col in colunas_possiveis:
            if col in row.index:
                dk = str(row[col]).strip()
                if len(dk) >= 8 and dk[:8].isdigit() and '-' not in dk:
                    return f"{dk[:4]}-{dk[4:6]}-{dk[6:8]}"
                elif len(dk) >= 10:
                    return dk[:10]
        return None

    # ──────────────────────────────────────────────
    # CONSULTA GENÉRICA: tabela diária
    # Transforma tabela DB com (data, sub, valor) em
    # dict { "YYYY-MM-DD": { "SE": v, "S": v, ... } }
    # ──────────────────────────────────────────────

    def consultar_diario(self, tabela, col_data = 'data_deck', col_sub = 'subsistema',
                         col_valor = ['pld_med', 'pld', 'pld_medio'], filtros = None, decimais = 2):
        """
        Consulta tabela do banco e retorna dict diário por subsistema.

        Parâmetros:
            tabela      : nome da tabela no banco
            col_data    : coluna que contém a data (str ou lista de possíveis)
            col_sub     : coluna que contém o subsistema
            col_valor   : coluna(s) com o valor numérico (str ou lista de possíveis)
            filtros     : dict com filtros {coluna: valor} para aplicar ao dataframe
            decimais    : casas decimais no arredondamento

        Retorna:
            dict { "YYYY-MM-DD": { "SE": valor, ... } }
        """
        if isinstance(col_data, str):
            col_data = [col_data]
        if isinstance(col_valor, str):
            col_valor = [col_valor]

        dados = self.tabela_banco(tabela)

        # Aplicar filtros
        if filtros:
            for col, val in filtros.items():
                if col in dados.columns:
                    dados = dados[dados[col].astype(str).str.strip() == str(val)]

        resultado = {}
        for _, row in dados.iterrows():
            dt = self._ler_data(row, col_data)
            if dt is None:
                continue

            sub = self.sub_nome(row.get(col_sub, ''))
            if sub not in self.SUBS:
                continue

            val = self._ler_valor(row, col_valor)
            if val is None:
                continue

            if dt not in resultado:
                resultado[dt] = {}
            resultado[dt][sub] = round(val, decimais)

        return resultado

    # ──────────────────────────────────────────────
    # CONSULTA: Decomp expandido (semanal → diário)
    # Interpreta ano_mes_rev_deck e expande dias
    # ──────────────────────────────────────────────

    def consultar_decomp_expandido(self, tabela = 'decomp_ccee_pld', col_amr = 'ano_mes_rev_deck',
                                    col_sub = 'sub', col_valor = ['pld', 'pld_med'],
                                    patamar_filtro = '0', decimais = 2):
        """
        Consulta Decomp e expande semana operativa em dias.

        Parâmetros:
            tabela          : tabela do banco
            col_amr         : coluna com ano_mes_rev_deck (ex: '20264_0')
            col_sub         : coluna com subsistema
            col_valor       : colunas possíveis para o valor
            patamar_filtro  : valor do patamar a filtrar (None = sem filtro)
            decimais        : casas decimais

        Retorna:
            dict { "YYYY-MM-DD": { "SE": valor, ... } }
        """
        if isinstance(col_valor, str):
            col_valor = [col_valor]

        dados = self.tabela_banco(tabela)
        resultado = {}

        for _, row in dados.iterrows():
            # Filtro de patamar
            if patamar_filtro is not None:
                pat = str(row.get('patamar', '')).strip()
                if pat != str(patamar_filtro):
                    continue

            sub = self.sub_nome(row.get(col_sub, ''))
            if sub not in self.SUBS:
                continue

            val = self._ler_valor(row, col_valor)
            if val is None:
                continue

            # Parse ano_mes_rev_deck
            amr = str(row.get(col_amr, '')).strip()
            try:
                parts = amr.split('_')
                rev = int(parts[1])
                ym = parts[0]
                if len(ym) == 5:       # "20264"
                    ano, mes = int(ym[:4]), int(ym[4:])
                elif len(ym) == 6:     # "202604"
                    ano, mes = int(ym[:4]), int(ym[4:6])
                else:
                    continue
            except:
                continue

            # Expandir semana operativa
            try:
                data_ref = self.date_cls(ano, mes, 1)
                data_ini = self.rev_n_data(data_ref, rev)
                data_fim_rev = self.rev_fim(data_ini)
            except:
                continue

            d = data_ini
            while d <= data_fim_rev:
                dk = d.strftime('%Y-%m-%d')
                if dk not in resultado:
                    resultado[dk] = {}
                resultado[dk][sub] = round(val, decimais)
                d += self.timedelta_cls(days = 1)

        return resultado

    # ──────────────────────────────────────────────
    # MONTAGEM DE PAYLOAD COMPLETO
    # Junta múltiplas consultas num dict único
    # ──────────────────────────────────────────────

    def montar_payload(self, consultas):
        """
        Monta dict final a partir de um dicionário de consultas.

        Parâmetros:
            consultas : dict { 'chave': resultado_dict }

        Retorna:
            dict com cada chave + metadados (subsistemas, exportado_em)
        """
        payload = {}
        for chave, dados in consultas.items():
            payload[chave] = dados
        payload['subsistemas'] = self.SUBS
        payload['exportado_em'] = self.date_cls.today().isoformat()
        return payload

    # ──────────────────────────────────────────────
    # PAYLOAD PLD (atalho para o caso mais comum)
    # Junta DESSEM diário + Decomp expandido
    # ──────────────────────────────────────────────

    def payload_pld(self):
        """Retorna payload pronto com DESSEM diário + Decomp expandido."""
        dessem = self.consultar_diario(
            tabela = 'dessem_pld_ccee',
            col_data = ['data_deck'],
            col_sub = 'subsistema',
            col_valor = ['pld_med', 'pld', 'pld_medio']
        )
        decomp = self.consultar_decomp_expandido()
        return self.montar_payload({'dessem': dessem, 'decomp': decomp})

    # ──────────────────────────────────────────────
    # EXPORTAR JSON PARA ARQUIVO
    # ──────────────────────────────────────────────

    def exportar_json(self, payload, path_saida, indent = 2):
        """
        Salva payload (dict) em arquivo JSON.

        Parâmetros:
            payload    : dict com dados
            path_saida : caminho completo do arquivo .json
            indent     : indentação do JSON
        """
        with open(path_saida, 'w', encoding = 'utf-8') as f:
            self.json.dump(payload, f, ensure_ascii = False, indent = indent)
        n_chaves = {k: len(v) if isinstance(v, dict) else v for k, v in payload.items()
                     if k not in ('subsistemas', 'exportado_em')}
        print(f"JSON salvo: {path_saida}")
        for k, v in n_chaves.items():
            print(f"  {k}: {v} dias")

    # ──────────────────────────────────────────────
    # REGISTRAR ROTAS DA API
    # ──────────────────────────────────────────────

    def registrar_rota(self, caminho, funcao):
        """
        Registra uma rota da API.

        Parâmetros:
            caminho : ex: '/api/pld'
            funcao  : callable que retorna dict (será serializado como JSON)

        Exemplo:
            dash.registrar_rota('/api/pld', dash.payload_pld)
        """
        self.rotas_api[caminho] = funcao

    # ──────────────────────────────────────────────
    # SERVIDOR HTTP LOCAL
    # ──────────────────────────────────────────────

    def criar_servidor(self, pasta_raiz = None, porta = None):
        """
        Cria e retorna um HTTPServer que serve arquivos estáticos
        e responde às rotas registradas via registrar_rota().

        Parâmetros:
            pasta_raiz : diretório base para servir arquivos (default: pasta atual)
            porta      : porta HTTP (default: self.porta_servidor)

        Retorna:
            HTTPServer pronto para .serve_forever()
        """
        if porta is None:
            porta = self.porta_servidor
        if pasta_raiz is not None:
            self.os.chdir(pasta_raiz)

        rotas = self.rotas_api
        json_mod = self.json
        parent = self

        class DashHandler(parent.SimpleHTTPRequestHandler):
            def do_GET(self):
                parsed = parent.urlparse(self.path)
                if parsed.path in rotas:
                    self._responder_api(parsed.path)
                else:
                    super().do_GET()

            def _responder_api(self, rota):
                try:
                    dados = rotas[rota]()
                    payload = json_mod.dumps(dados, ensure_ascii = False)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(payload.encode('utf-8'))
                except Exception as e:
                    print(f"[API ERRO] {rota}: {e}")
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json_mod.dumps({'erro': str(e)}).encode('utf-8'))

            def log_message(self, format, *args):
                if '/api/' in str(args[0]):
                    super().log_message(format, *args)

        servidor = self.HTTPServer(('localhost', porta), DashHandler)
        print(f"Servidor rodando em: http://localhost:{porta}")
        return servidor

    def servir(self, pasta_raiz = None, porta = None):
        """Cria e roda o servidor (bloqueante). Ctrl+C para encerrar."""
        servidor = self.criar_servidor(pasta_raiz = pasta_raiz, porta = porta)
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")

    # ──────────────────────────────────────────────
    # GERAR HTML TEMPLATE BASE
    # ──────────────────────────────────────────────

    def template_html(self, titulo = 'Dashboard', subtitulo = '', abas = None, path_logo = 'logo_2.png'):
        """
        Retorna string HTML base com header Bem Energia, nav e seções vazias.

        Parâmetros:
            titulo    : título do header
            subtitulo : subtítulo
            abas      : lista de dicts [{'id': 'pld-cmo', 'label': 'PLD / CMO'}, ...]
            path_logo : caminho relativo da logo

        Retorna:
            str com HTML completo
        """
        if abas is None:
            abas = [{'id': 'principal', 'label': 'Principal'}]

        nav_btns = ''
        sections = ''
        for i, aba in enumerate(abas):
            active = ' class="active"' if i == 0 else ''
            nav_btns += f'        <button{active} data-page="{aba["id"]}">{aba["label"]}</button>\n'
            cls = ' active' if i == 0 else ''
            sections += f'    <section id="{aba["id"]}" class="page{cls}">\n'
            sections += f'        <h2>{aba["label"]}</h2>\n'
            sections += f'    </section>\n\n'

        html = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{titulo}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Barlow', sans-serif; background: #ffffff; color: #1a1a1a; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; padding: 20px 32px; border-bottom: 3px solid #C8E000; }}
        .header-left {{ display: flex; flex-direction: column; gap: 4px; }}
        .header-title {{ font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 26px; }}
        .header-subtitle {{ font-family: 'Barlow', sans-serif; font-weight: 500; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1.5px; }}
        .header-date {{ font-family: 'JetBrains Mono', monospace; font-size: 20px; color: #1a1a1a; margin-top: 6px; }}
        .logo img {{ height: 100px; width: auto; }}
        .nav {{ display: flex; gap: 0; background: #fafafa; border-bottom: 1px solid #e0e0e0; padding: 0 32px; }}
        .nav button {{ font-family: 'Barlow', sans-serif; font-weight: 500; font-size: 14px; color: #888; background: none; border: none; border-bottom: 3px solid transparent; padding: 12px 20px; cursor: pointer; transition: all 0.2s ease; }}
        .nav button:hover {{ color: #1a1a1a; background: #f0f0f0; }}
        .nav button.active {{ color: #1a1a1a; font-weight: 600; border-bottom: 3px solid #C8E000; }}
        .page {{ display: none; padding: 24px 32px; }}
        .page.active {{ display: block; }}
        .page h2 {{ font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 20px; color: #999; }}
    </style>
</head>
<body>
    <header class="header">
        <div class="header-left">
            <div class="header-title">{titulo}</div>
            <div class="header-subtitle">{subtitulo}</div>
            <div class="header-date" id="data-hoje"></div>
        </div>
        <div class="logo"><img src="{path_logo}" alt="Bem Energia"></div>
    </header>

    <nav class="nav">
{nav_btns}    </nav>

{sections}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
    <script>
        (function() {{
            var h = new Date();
            var f = h.toLocaleDateString('pt-BR', {{ weekday:'long', day:'numeric', month:'long', year:'numeric' }});
            document.getElementById('data-hoje').textContent = f.charAt(0).toUpperCase() + f.slice(1);
        }})();
        (function() {{
            var bs = document.querySelectorAll('.nav button');
            var ps = document.querySelectorAll('.page');
            bs.forEach(function(b) {{
                b.addEventListener('click', function() {{
                    bs.forEach(function(x) {{ x.classList.remove('active'); }});
                    ps.forEach(function(x) {{ x.classList.remove('active'); }});
                    b.classList.add('active');
                    document.getElementById(b.dataset.page).classList.add('active');
                }});
            }});
        }})();
    </script>
</body>
</html>'''
        return html

    def salvar_template(self, path_saida, **kwargs):
        """Gera e salva HTML template."""
        html = self.template_html(**kwargs)
        with open(path_saida, 'w', encoding = 'utf-8') as f:
            f.write(html)
        print(f"HTML salvo: {path_saida}")

    # ──────────────────────────────────────────────
    # GERAR .BAT DE ATUALIZAÇÃO
    # ──────────────────────────────────────────────

    def gerar_bat(self, path_bat, path_script_export, path_html = None):
        """
        Gera arquivo .bat que roda o script de exportação e abre o HTML.

        Parâmetros:
            path_bat           : caminho do .bat a criar
            path_script_export : caminho do .py que exporta o JSON
            path_html          : caminho do HTML (se None, não abre navegador)
        """
        linhas = ['@echo off', f'python "{path_script_export}"']
        if path_html:
            linhas.append(f'start "" "{path_html}"')
        with open(path_bat, 'w', encoding = 'utf-8') as f:
            f.write('\n'.join(linhas) + '\n')
        print(f"BAT salvo: {path_bat}")